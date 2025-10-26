import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем вендора
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file: File | null = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем уникальное имя файла
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'pdf'
    const filename = `vendor_${vendor.id}_${timestamp}.${extension}`

    // Путь к папке uploads
    const uploadsDir = join(process.cwd(), 'uploads')
    
    // Создаем папку uploads если её нет
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Путь к файлу
    const filepath = join(uploadsDir, filename)

    // Сохраняем файл
    await writeFile(filepath, buffer)

    // Создаем запись в базе данных
    const document = await prisma.document.create({
      data: {
        vendorId: vendor.id,
        docType: 'OTHER',
        fileUrl: filename,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize
      }
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ 
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
