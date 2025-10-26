import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { createModerationHistory } from '@/lib/vendor-moderation-history'

// POST /api/vendors/resubmit - повторная отправка заявки вендора
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 VENDOR RESUBMIT API: Request body:', body)
    
    const {
      displayName,
      cityId,
      description,
      phone,
      email,
      website,
      supportEmail,
      supportPhone,
      brandSlug,
      // Данные для подтверждения представительства
      proofType,
      proofData,
      additionalProofData,
      // Согласия
      agreements
    } = body

    // Валидация обязательных полей
    if (!displayName || !cityId || !proofType || !proofData) {
      return NextResponse.json({ 
        error: 'Обязательные поля: displayName, cityId, proofType, proofData' 
      }, { status: 400 })
    }

    // Получаем существующего вендора
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { vendorRole: true }
    })

    if (!existingVendor) {
      return NextResponse.json({ 
        error: 'Vendor not found' 
      }, { status: 404 })
    }

    // Проверяем, что статус позволяет повторную отправку
    if (existingVendor.kycStatus !== 'NEEDS_INFO') {
      return NextResponse.json({ 
        error: 'Vendor status does not allow resubmission' 
      }, { status: 400 })
    }

    // Проверяем уникальность brandSlug (если изменился)
    if (brandSlug && brandSlug !== existingVendor.brandSlug) {
      const existingSlug = await prisma.vendor.findUnique({
        where: { brandSlug }
      })
      
      if (existingSlug) {
        return NextResponse.json({ 
          error: 'Такой slug уже используется' 
        }, { status: 400 })
      }
    }

    // Обновляем данные вендора
    const updatedVendor = await prisma.vendor.update({
      where: { id: existingVendor.id },
      data: {
        displayName,
        cityId: parseInt(cityId),
        description,
        phone,
        email,
        website,
        supportEmail,
        supportPhone,
        brandSlug,
        kycStatus: 'SUBMITTED', // Возвращаем на модерацию
        // Обновляем данные для подтверждения представительства
        proofType,
        proofData,
        additionalProofData,
        agreements,
        updatedAt: new Date()
      }
    })
    
    console.log('🔍 VENDOR RESUBMIT API: Vendor updated:', updatedVendor.id)

    // Создаем новый документ для подтверждения представительства только если proofData не пустое
    if (proofData && proofData.trim()) {
      await prisma.document.create({
        data: {
          vendorId: updatedVendor.id,
          docType: 'OTHER',
          fileUrl: proofData,
          fileName: proofData,
          fileSize: 0,
          status: 'PENDING'
        }
      })
    }

    // Обновляем запись онбординга
    await prisma.vendorOnboarding.update({
      where: { vendorId: updatedVendor.id },
      data: {
        step: 2, // Переходим к шагу ожидания модерации
        completedSteps: [1], // Шаг 1 (заполнение информации) завершен
        isCompleted: false,
        updatedAt: new Date()
      }
    })

    // Записываем в историю модераций
    try {
      await createModerationHistory({
        vendorId: updatedVendor.id,
        action: 'RESUBMITTED',
        previousStatus: 'NEEDS_INFO',
        newStatus: 'SUBMITTED',
        documentsCount: proofData && proofData.trim() ? 1 : 0,
        documentsList: proofData && proofData.trim() ? [{
          fileName: proofData,
          fileUrl: proofData,
          docType: 'OTHER'
        }] : [],
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (historyError) {
      console.error('🔍 VENDOR RESUBMIT API: Error creating moderation history:', historyError)
      // Не прерываем обновление вендора из-за ошибки истории
    }

    return NextResponse.json({ 
      success: true, 
      vendor: {
        id: updatedVendor.id,
        displayName: updatedVendor.displayName,
        type: updatedVendor.type,
        kycStatus: updatedVendor.kycStatus,
        brandSlug: updatedVendor.brandSlug
      }
    })

  } catch (error) {
    console.error('Error resubmitting vendor application:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
