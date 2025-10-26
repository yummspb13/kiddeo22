import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

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
      filename: filename 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
