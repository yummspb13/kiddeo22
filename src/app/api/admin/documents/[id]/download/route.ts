import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    const { id } = await params
    const documentId = parseInt(id)
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }

    // Получаем документ из базы данных
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Проверяем, что файл существует
    if (!document.fileUrl) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Читаем файл
    const fs = require('fs')
    const path = require('path')
    
    const filePath = path.join(process.cwd(), 'uploads', document.fileUrl)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    
    // Определяем MIME тип
    const ext = path.extname(document.fileName || '').toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    }
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    // Возвращаем файл
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName || 'document'}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
