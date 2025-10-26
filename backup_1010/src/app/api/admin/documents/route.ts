import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await requireAdminOrDevKey(searchParams as any)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const docType = searchParams.get('docType')
    const vendorId = searchParams.get('vendorId')
    
    const skip = (page - 1) * limit
    
    // Строим фильтры
    const where: any = {}
    if (status) where.status = status
    if (docType) where.docType = docType
    if (vendorId) where.vendorId = parseInt(vendorId)
    
    // Получаем документы с информацией о вендоре
    const documents = await prisma.document.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            displayName: true,
            type: true,
            kycStatus: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })
    
    // Получаем общее количество
    const total = await prisma.document.count({ where })
    
    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authResult = await requireAdminOrDevKey(searchParams as any)
    
    const body = await request.json()
    const { documentId, status, moderatorNotes, rejectionReason } = body
    
    if (!documentId || !status) {
      return NextResponse.json(
        { error: 'Document ID and status are required' },
        { status: 400 }
      )
    }
    
    // Обновляем статус документа
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        moderatorNotes,
        rejectionReason,
        moderatorId: authResult.user.id,
        moderatedAt: new Date()
      },
      include: {
        vendor: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })
    
    // Создаем запись в аудит-логе
    await prisma.auditLog.create({
      data: {
        user: {
          connect: { id: authResult.user.id }
        },
        action: 'DOCUMENT_MODERATED',
        entityType: 'DOCUMENT',
        entityId: documentId.toString(),
        details: {
          documentId,
          status,
          moderatorNotes,
          rejectionReason,
          vendorId: updatedDocument.vendorId
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })
    
    // Отправляем уведомление вендору (если нужно)
    if (status === 'APPROVED' || status === 'REJECTED') {
      // Здесь можно добавить отправку email уведомления
      console.log(`Document ${documentId} ${status.toLowerCase()} for vendor ${updatedDocument.vendorId}`)
    }
    
    return NextResponse.json({ success: true, document: updatedDocument })
  } catch (error) {
    console.error('❌ Error updating document:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to update document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
