import { NextRequest, NextResponse } from 'next/server';
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
    const type = formData.get('type') as string; // 'icon' или 'background'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['icon', 'background'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

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

    console.log(`🔍 UPLOAD API: File uploaded successfully: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('🔍 UPLOAD API: Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error },
      { status: 500 }
    );
  }
}