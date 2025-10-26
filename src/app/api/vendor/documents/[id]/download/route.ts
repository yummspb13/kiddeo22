import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

// GET /api/vendor/documents/[id]/download - скачать документ вендора
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const documentId = parseInt(id)

    // Получаем вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Получаем документ, проверяя что он принадлежит этому вендору
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        vendorId: vendor.id
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Путь к файлу
    const filePath = join(process.cwd(), 'uploads', document.fileUrl)

    // Проверяем что файл существует
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Читаем файл
    const fileBuffer = await readFile(filePath)

    // Определяем MIME type
    const mimeType = document.mimeType || 'application/octet-stream'

    // Возвращаем файл
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ 
      error: 'Failed to download document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
