import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, cloudinaryTransformations, isCloudinaryConfigured } from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general'; // Тип файла для папки

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Пытаемся загрузить в Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(file, {
          folder: `kiddeo/${type}`,
          transformation: cloudinaryTransformations[type as keyof typeof cloudinaryTransformations] || cloudinaryTransformations.event
        });

        return NextResponse.json({ 
          success: true, 
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          provider: 'cloudinary'
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local:', cloudinaryError);
        // Fallback к локальному хранилищу
      }
    }

    // Fallback: локальное хранилище (только в development)
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'File upload service not configured. Please contact support.',
        code: 'UPLOAD_SERVICE_NOT_CONFIGURED',
        message: 'Cloudinary integration is not properly configured.'
      }, { status: 503 });
    }

    // Локальное сохранение (только в development)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `upload_${timestamp}.${extension}`;

    // Путь к папке uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Создаем папку uploads если её нет
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Путь к файлу
    const filepath = join(uploadsDir, filename);

    // Сохраняем файл
    await writeFile(filepath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: filename,
      provider: 'local'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
