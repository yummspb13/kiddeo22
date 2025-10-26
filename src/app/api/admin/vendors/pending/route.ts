import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createModerationHistory } from '@/lib/vendor-moderation-history'
export const runtime = 'nodejs'

// GET /api/admin/vendors/pending - получить список вендоров на модерации
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь админ
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { RoleAssignment: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Получаем вендоров на модерации
    const pendingVendors = await prisma.vendor.findMany({
      where: {
        kycStatus: 'SUBMITTED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        },
        VendorOnboarding: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      vendors: pendingVendors
    })

  } catch (error) {
    console.error('Error fetching pending vendors:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/admin/vendors/pending - обновить статус модерации вендора
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь админ
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { RoleAssignment: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { vendorId, status, reason } = body

    if (!vendorId || !status) {
      return NextResponse.json({ 
        error: 'vendorId and status are required' 
      }, { status: 400 })
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: 'status must be APPROVED or REJECTED' 
      }, { status: 400 })
    }

    // Обновляем статус вендора
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(vendorId) },
      data: {
        kycStatus: status,
        canPostEvents: status === 'APPROVED',
        canPostCatalog: status === 'APPROVED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Если одобрен, обновляем онбординг
    if (status === 'APPROVED') {
      await prisma.vendorOnboarding.update({
        where: { vendorId: parseInt(vendorId) },
        data: {
          step: 3, // Переходим к следующему шагу
          completedSteps: [1, 2], // Шаги 1 и 2 завершены
          updatedAt: new Date()
        }
      })
    }

    // Записываем в историю модераций
    try {
      await createModerationHistory({
        vendorId: parseInt(vendorId),
        action: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        previousStatus: 'SUBMITTED',
        newStatus: status,
        moderatorId: user.id,
        moderatorNotes: reason,
        rejectionReason: status === 'REJECTED' ? reason : undefined,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (historyError) {
      console.error('🔍 ADMIN VENDORS API: Error creating moderation history:', historyError)
      // Не прерываем модерацию из-за ошибки истории
    }

    // Отправляем email уведомление пользователю
    try {
      let emailResult
      if (status === 'APPROVED') {
        emailResult = await sendEmail(emailTemplates.vendorApproved(
          updatedVendor.displayName, 
          updatedVendor.user.email
        ) as any)
      } else {
        emailResult = await sendEmail(emailTemplates.vendorRejected(
          updatedVendor.displayName, 
          updatedVendor.user.email,
          reason || 'Не указана причина'
        ) as any)
      }
      
      if (emailResult.success) {
        console.log(`Email notification sent for vendor ${vendorId} ${status.toLowerCase()}`)
      } else {
        console.error(`Failed to send email for vendor ${vendorId}:`, emailResult.error)
      }
    } catch (emailError) {
      console.error(`Email error for vendor ${vendorId}:`, emailError)
      // Не прерываем обновление статуса из-за ошибки email
    }

    console.log(`Vendor ${vendorId} ${status.toLowerCase()}. Reason: ${reason || 'No reason provided'}`)

    return NextResponse.json({
      success: true,
      vendor: updatedVendor
    })

  } catch (error) {
    console.error('Error updating vendor status:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
