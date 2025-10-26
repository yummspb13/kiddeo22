import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/vendor-applications - получить заявки на регистрацию вендоров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    // Получаем заявки на регистрацию вендоров
    const applications = await prisma.vendor.findMany({
      where: {
        kycStatus: {
          in: ['DRAFT', 'SUBMITTED', 'NEEDS_INFO', 'APPROVED', 'REJECTED']
        }
      },
      include: {
        vendorRole: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        city: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching vendor applications:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/admin/vendor-applications/:id - обновить статус заявки
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authResult = await requireAdminOrDevKey(searchParams as any)
    const vendorId = searchParams.get('id')
    const { status, notes } = await request.json()

    const user = authResult.user

    console.log('🔍 PATCH vendor-applications:', { vendorId, status, notes })

    if (!vendorId || !status) {
      return NextResponse.json({ error: 'Missing vendorId or status' }, { status: 400 })
    }

    // Получаем IP адрес
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Обновляем статус вендора
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(vendorId) },
      data: {
        kycStatus: status,
        // При одобрении даем права на публикацию
        canPostEvents: status === 'APPROVED',
        canPostCatalog: status === 'APPROVED'
      },
      include: {
        vendorRole: true,
        city: true
      }
    })

    // Сохраняем информацию о модераторе
    await prisma.vendorRole.upsert({
      where: { vendorId: parseInt(vendorId) },
      update: {
        moderatorNotes: notes || null,
        moderatedBy: user.id,
        moderatedAt: new Date(),
        moderatorIp: ip
      },
      create: {
        vendorId: parseInt(vendorId),
        moderatorNotes: notes || null,
        moderatedBy: user.id,
        moderatedAt: new Date(),
        moderatorIp: ip
      }
    })

    console.log('✅ Moderator info saved:', {
      moderatorId: user.id,
      moderatorName: user.name,
      moderatorEmail: user.email,
      ip: ip,
      notes: notes
    })

    // Отправляем email уведомление вендору
    try {
      const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/vendor-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorId: parseInt(vendorId),
          type: status === 'APPROVED' ? 'application_approved' : 
                status === 'REJECTED' ? 'application_rejected' : 'application_needs_info',
          data: {
            reason: notes
          }
        })
      })

      if (notificationResponse.ok) {
        console.log('✅ Email notification sent to vendor')
      } else {
        console.error('❌ Failed to send email notification')
      }
    } catch (emailError) {
      console.error('❌ Error sending email notification:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      vendor: updatedVendor 
    })

  } catch (error) {
    console.error('❌ Error updating vendor application:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
