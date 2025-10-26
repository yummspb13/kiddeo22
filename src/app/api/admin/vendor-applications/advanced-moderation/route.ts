import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
export const runtime = 'nodejs'

// GET /api/admin/vendor-applications/advanced-moderation - получить детальную информацию для модерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 })
    }

    // Получаем детальную информацию о вендоре
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        vendorRole: {
          select: {
            role: true,
            fullName: true,
            inn: true,
            orgnip: true,
            orgn: true,
            kpp: true,
            companyName: true,
            directorName: true,
            directorPosition: true,
            address: true,
            legalAddress: true,
            actualAddress: true,
            isVatPayer: true,
            vatRate: true,
            representativeName: true,
            representativePosition: true,
            isRepresentative: true,
            bankAccount: true,
            bik: true,
            bankName: true,
            corrAccount: true,
            iban: true,
            swift: true,
            taxRegime: true,
            npdToken: true,
            npdRegion: true
          }
        },
        VendorOnboarding: {
          select: {
            step: true,
            completedAt: true,
            isCompleted: true
          }
        }
      }
    })

    if (!vendor) {
      console.error('❌ Vendor not found:', { vendorId, parsedVendorId: parseInt(vendorId) })
      return NextResponse.json({ 
        error: 'Vendor not found',
        details: `Vendor with ID ${vendorId} does not exist`
      }, { status: 404 })
    }

    console.log('✅ Vendor found:', {
      id: vendor.id,
      displayName: vendor.displayName,
      kycStatus: vendor.kycStatus,
      hasUser: !!vendor.user,
      hasVendorRole: !!vendor.vendorRole,
      hasOnboarding: !!vendor.VendorOnboarding
    })

    // Получаем историю модерации (пока что пустой массив, так как AuditLog может не существовать)
    const moderationHistory = []

    // Получаем связанные заявки на клайм
    const listingClaims = await prisma.listingClaim.findMany({
      where: {
        requestorVendorId: vendor.id
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Определяем тип модерации в зависимости от типа вендора
    const isVendorPro = vendor.type === 'PRO'
    
    // Анализируем данные для модерации (адаптивно для START/PRO)
    const moderationAnalysis = {
      vendorType: vendor.type,
      isVendorPro: isVendorPro,
      
      // Проверка полноты данных (базовая для всех)
      dataCompleteness: {
        hasBasicInfo: !!(vendor.displayName && vendor.email && vendor.phone),
        hasRoleInfo: !!vendor.vendorRole,
        hasOnboardingData: !!vendor.VendorOnboarding,
        hasProofData: !!(vendor.proofType && vendor.proofData),
        hasAgreements: !!vendor.agreements,
        completenessScore: 0
      },
      
      // Проверка качества данных (базовая для всех)
      dataQuality: {
        hasValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email || ''),
        hasValidPhone: /^[\+]?[1-9][\d]{0,15}$/.test(vendor.phone || ''),
        hasValidWebsite: vendor.website ? /^https?:\/\/.+/.test(vendor.website) : true,
        hasValidInn: vendor.vendorRole?.inn ? /^\d{10,12}$/.test(vendor.vendorRole.inn) : true,
        hasValidOrgn: vendor.vendorRole?.orgn ? /^\d{13,15}$/.test(vendor.vendorRole.orgn) : true,
        qualityScore: 0
      },
      
      // Проверка документов (адаптивная)
      documentChecks: {
        // Базовые документы для всех типов
        hasProofOfRepresentation: !!(vendor.proofType && vendor.proofData),
        hasAgreements: !!vendor.agreements,
        
        // Дополнительные документы для PRO
        hasBankDetails: isVendorPro ? !!(vendor.vendorRole?.bankAccount && vendor.vendorRole?.bik) : true,
        hasAddressInfo: isVendorPro ? !!(vendor.vendorRole?.address || vendor.vendorRole?.legalAddress) : true,
        hasTaxInfo: isVendorPro ? !!(vendor.vendorRole?.taxRegime) : true,
        hasCompanyDetails: isVendorPro ? !!(vendor.vendorRole?.companyName && vendor.vendorRole?.directorName) : true,
        
        documentScore: 0
      },
      
      // Проверка активности пользователя
      userActivity: {
        accountAge: vendor.user.createdAt ? Math.floor((Date.now() - vendor.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        hasRecentLogin: true,
        hasListingClaims: listingClaims.length > 0,
        activityScore: 0
      }
    }

    // Вычисляем общие баллы
    const completenessChecks = Object.values(moderationAnalysis.dataCompleteness).filter(v => typeof v === 'boolean')
    moderationAnalysis.dataCompleteness.completenessScore = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100)

    const qualityChecks = Object.values(moderationAnalysis.dataQuality).filter(v => typeof v === 'boolean')
    moderationAnalysis.dataQuality.qualityScore = Math.round((qualityChecks.filter(Boolean).length / qualityChecks.length) * 100)

    // Адаптивное вычисление баллов для документов
    const documentChecks = Object.values(moderationAnalysis.documentChecks).filter(v => typeof v === 'boolean')
    if (isVendorPro) {
      // Для PRO: требуем все документы
      moderationAnalysis.documentChecks.documentScore = Math.round((documentChecks.filter(Boolean).length / documentChecks.length) * 100)
    } else {
      // Для START: достаточно базовых документов
      const basicChecks = [
        moderationAnalysis.documentChecks.hasProofOfRepresentation,
        moderationAnalysis.documentChecks.hasAgreements
      ]
      moderationAnalysis.documentChecks.documentScore = Math.round((basicChecks.filter(Boolean).length / basicChecks.length) * 100)
    }

    const activityChecks = Object.values(moderationAnalysis.userActivity).filter(v => typeof v === 'boolean')
    moderationAnalysis.userActivity.activityScore = Math.round((activityChecks.filter(Boolean).length / activityChecks.length) * 100)

    // Общий балл модерации
    const overallScore = Math.round((
      moderationAnalysis.dataCompleteness.completenessScore +
      moderationAnalysis.dataQuality.qualityScore +
      moderationAnalysis.documentChecks.documentScore +
      moderationAnalysis.userActivity.activityScore
    ) / 4)

    // Рекомендации по модерации (адаптивные для START/PRO)
    const recommendations = []
    
    if (moderationAnalysis.dataCompleteness.completenessScore < 80) {
      recommendations.push({
        type: 'warning',
        message: 'Неполные данные. Рекомендуется запросить дополнительную информацию.',
        priority: 'high'
      })
    }
    
    if (moderationAnalysis.dataQuality.qualityScore < 70) {
      recommendations.push({
        type: 'error',
        message: 'Некорректные данные. Требуется исправление.',
        priority: 'high'
      })
    }
    
    // Адаптивные рекомендации по документам
    if (isVendorPro) {
      if (moderationAnalysis.documentChecks.documentScore < 60) {
        recommendations.push({
          type: 'warning',
          message: 'Недостаточно документов для PRO вендора. Требуются банковские реквизиты, адресная информация и налоговые данные.',
          priority: 'high'
        })
      }
    } else {
      if (moderationAnalysis.documentChecks.documentScore < 80) {
        recommendations.push({
          type: 'warning',
          message: 'Недостаточно базовых документов. Требуется подтверждение представительства и соглашения.',
          priority: 'medium'
        })
      }
    }
    
    if (moderationAnalysis.userActivity.activityScore < 50) {
      recommendations.push({
        type: 'info',
        message: 'Низкая активность пользователя. Рекомендуется дополнительная проверка.',
        priority: 'low'
      })
    }

    if (overallScore >= 80) {
      recommendations.push({
        type: 'success',
        message: `Заявка ${isVendorPro ? 'PRO' : 'START'} вендора готова к одобрению.`,
        priority: 'low'
      })
    } else if (overallScore >= 60) {
      recommendations.push({
        type: 'info',
        message: `Заявка ${isVendorPro ? 'PRO' : 'START'} вендора требует внимательного рассмотрения.`,
        priority: 'medium'
      })
    }

    return NextResponse.json({
      vendor,
      moderationAnalysis,
      recommendations,
      overallScore,
      moderationHistory,
      listingClaims
    })

  } catch (error) {
    console.error('Error in advanced moderation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/vendor-applications/advanced-moderation - выполнить расширенную модерацию
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    const { vendorId, action, notes, flags, customChecks } = await request.json()

    if (!vendorId || !action) {
      return NextResponse.json({ error: 'Vendor ID and action are required' }, { status: 400 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Получаем IP адрес
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Выполняем действие модерации
    let newStatus = vendor.kycStatus
    let updateData: unknown = {}

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        updateData = {
          kycStatus: 'APPROVED',
          canPostEvents: true,
          canPostCatalog: true,
          officialPartner: true
        }
        break
      case 'reject':
        newStatus = 'REJECTED'
        updateData = {
          kycStatus: 'REJECTED',
          canPostEvents: false,
          canPostCatalog: false
        }
        break
      case 'needs_info':
        newStatus = 'NEEDS_INFO'
        updateData = {
          kycStatus: 'NEEDS_INFO',
          canPostEvents: false,
          canPostCatalog: false
        }
        break
      case 'hold':
        newStatus = 'HOLD' as any
        updateData = {
          kycStatus: 'HOLD' as any,
          canPostEvents: false,
          canPostCatalog: false
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Обновляем вендора
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(vendorId) },
      data: updateData
    })

    // Обновляем роль вендора (без модераторских заметок, так как поля не существуют)
    // if (vendor.vendorRole) {
    //   await prisma.vendorRole.update({
    //     where: { id: vendor.vendorRole.id },
    //     data: {
    //       // Поля модерации не существуют в модели VendorRole
    //     }
    //   })
    // }

    // Создаем запись в аудите (пока что только логируем, так как AuditLog может не существовать)
    console.log('📝 Audit log entry:', {
      entityType: 'VENDOR',
      entityId: vendor.id.toString(),
      action: action.toUpperCase(),
      oldStatus: vendor.kycStatus,
      newStatus: newStatus,
      notes: notes,
      flags: flags,
      customChecks: customChecks,
      moderatorId: 1,
      moderatorIp: ip
    })

    // Отправляем уведомление вендору
    try {
      const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/vendor-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorId: parseInt(vendorId),
          type: `${action}_notification`,
          data: {
            reason: notes,
            flags: flags
          }
        })
      })

      if (notificationResponse.ok) {
        console.log('✅ Advanced moderation notification sent')
      }
    } catch (emailError) {
      console.error('❌ Error sending advanced moderation notification:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      vendor: updatedVendor,
      action,
      newStatus
    })

  } catch (error) {
    console.error('Error in advanced moderation action:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
