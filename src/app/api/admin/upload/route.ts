import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, cloudinaryTransformations, isCloudinaryConfigured } from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'icon', 'background', 'news'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['icon', 'background', 'news'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Пытаемся загрузить в Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(file, {
          folder: `kiddeo/admin/${type}`,
          transformation: cloudinaryTransformations[type as keyof typeof cloudinaryTransformations] || cloudinaryTransformations.event
        });

        console.log(`🔍 ADMIN UPLOAD: File uploaded to Cloudinary: ${result.secure_url}`);

        return NextResponse.json({
          success: true,
          url: result.secure_url,
          fileName: result.public_id,
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
        error: 'File upload service not configured. Please configure Cloudinary.',
        code: 'UPLOAD_SERVICE_NOT_CONFIGURED',
        message: 'Cloudinary integration is not properly configured.'
      }, { status: 503 });
    }

    // Локальное сохранение (только в development)
    // Создаем директории если их нет
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Конвертируем файл в буфер и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем путь к файлу
    const fileUrl = `/uploads/${type}/${fileName}`;

    console.log(`🔍 ADMIN UPLOAD: File uploaded locally: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      provider: 'local'
    });
  } catch (error) {
    console.error('🔍 ADMIN UPLOAD: Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}