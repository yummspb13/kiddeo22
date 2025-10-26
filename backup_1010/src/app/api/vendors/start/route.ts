import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createModerationHistory } from '@/lib/vendor-moderation-history'

// POST /api/vendors/start - создать Vendor Start
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 VENDOR START API: Request body:', body)
    
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

    // Проверяем, что пользователь еще не является вендором
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (existingVendor) {
      return NextResponse.json({ 
        error: 'Пользователь уже зарегистрирован как вендор' 
      }, { status: 400 })
    }

    // Проверяем уникальность brandSlug
    if (brandSlug) {
      const existingSlug = await prisma.vendor.findUnique({
        where: { brandSlug }
      })
      
      if (existingSlug) {
        return NextResponse.json({ 
          error: 'Такой slug уже используется' 
        }, { status: 400 })
      }
    }

    // Создаем вендора
    console.log('🔍 VENDOR START API: Creating vendor with data:', {
      userId: parseInt(session.user.id),
      displayName,
      cityId: parseInt(cityId),
      proofType,
      proofData
    })
    
    const vendor = await prisma.vendor.create({
      data: {
        userId: parseInt(session.user.id),
        displayName,
        cityId: parseInt(cityId),
        description,
        phone,
        email,
        website,
        supportEmail,
        supportPhone,
        brandSlug,
        type: 'START',
        kycStatus: 'SUBMITTED', // Заявка отправлена на модерацию
        payoutEnabled: false,
        officialPartner: false,
        subscriptionStatus: 'INACTIVE',
        canPostEvents: false, // Блокируем до одобрения
        canPostCatalog: false, // Блокируем до одобрения
        // Сохраняем данные для подтверждения представительства
        proofType,
        proofData,
        additionalProofData,
        agreements
      }
    })
    
    console.log('🔍 VENDOR START API: Vendor created:', vendor.id)

    // Отправляем email уведомление пользователю
    // Временно отключено из-за проблем с nodemailer
    /*
    try {
      const emailResult = await sendEmail(emailTemplates.vendorSubmitted(vendor.displayName, vendor.email || session.user.email || ''))
      if (emailResult.success) {
        console.log('🔍 VENDOR START API: Email notification sent')
      } else {
        console.error('🔍 VENDOR START API: Failed to send email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('🔍 VENDOR START API: Email error:', emailError)
      // Не прерываем создание вендора из-за ошибки email
    }
    */

    // Создаем запись роли (пока без детальной информации)
    await prisma.vendorRole.create({
      data: {
        vendorId: vendor.id,
        role: 'NPD', // По умолчанию самозанятый
        fullName: session.user.name || '',
        representativeName: session.user.name || '',
        isRepresentative: true
      }
    })

    // Создаем документ для подтверждения представительства
    await prisma.document.create({
      data: {
        vendorId: vendor.id,
        docType: 'OTHER', // Тип документа
        fileUrl: proofData, // Имя файла
        fileName: proofData,
        fileSize: 0, // Размер файла (будет обновлен при загрузке)
        status: 'PENDING' // Статус на модерации
      }
    })

    // Создаем запись онбординга
    await prisma.vendorOnboarding.create({
      data: {
        vendorId: vendor.id,
        step: 2, // Переходим к шагу ожидания модерации
        completedSteps: [1], // Шаг 1 (заполнение информации) завершен
        isCompleted: false,
        updatedAt: new Date()
      }
    })

    // Записываем в историю модераций
    try {
      await createModerationHistory({
        vendorId: vendor.id,
        action: 'SUBMITTED',
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        documentsCount: 1,
        documentsList: [{
          fileName: proofData,
          fileUrl: proofData,
          docType: 'OTHER'
        }],
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (historyError) {
      console.error('🔍 VENDOR START API: Error creating moderation history:', historyError)
      // Не прерываем создание вендора из-за ошибки истории
    }

    // Создаем бесплатную подписку
    const freePlan = await prisma.vendorTariffPlan.findFirst({
      where: { tariff: 'FREE' }
    })

    if (freePlan) {
      await prisma.vendorSubscription.create({
        data: {
          vendorId: vendor.id,
          tariffPlanId: freePlan.id,
          status: 'PAID',
          startsAt: new Date(),
          autoRenew: true
        } as any
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor: {
        id: vendor.id,
        displayName: vendor.displayName,
        type: vendor.type,
        kycStatus: vendor.kycStatus,
        brandSlug: vendor.brandSlug
      }
    })

  } catch (error) {
    console.error('Error creating vendor start:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/vendors/start - получить информацию о Vendor Start
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: {
        vendorRole: true,
        city: true,
        VendorOnboarding: true
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json({ vendor })

  } catch (error) {
    console.error('Error fetching vendor start:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
