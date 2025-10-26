import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/admin/venues/vendors - получить всех вендоров
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Получаем существующих вендоров из таблицы Vendor
    const where: any = {}
    if (cityId) where.cityId = parseInt(cityId)
    
    // Добавляем поиск по имени вендора
    if (search) {
      where.displayName = { contains: search, mode: 'insensitive' }
    }

    const [vendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          venueVendor: {
            include: {
              users: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              },
              documentsCheckedByUser: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          venuePartners: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.vendor.count({ where })
    ])

    // Преобразуем в формат VenueVendor
    const venueVendors = vendors.map(vendor => {
      const venueVendor = vendor.venueVendor
      const partnerCount = vendor.venuePartners.length
      
      // Определяем статус на основе данных
      let vendorStatus = 'ACTIVE'
      if (venueVendor) {
        vendorStatus = venueVendor.status
      } else {
        // Если нет записи в VenueVendor, считаем неполным
        vendorStatus = 'INCOMPLETE'
      }

      // Определяем статус документов
      let documentsStatus = 'NONE'
      if (venueVendor) {
        // Если есть документ ЕГРЮЛ, статус PENDING
        if (venueVendor.egryulDocument) {
          documentsStatus = 'PENDING'
        } else {
          documentsStatus = venueVendor.documentsStatus
        }
      }

      // Вычисляем дни до удаления
      const daysUntilDeletion = vendorStatus === 'DELETED' ? null : 
        partnerCount > 0 ? null : 
        Math.max(0, 30 - Math.floor((Date.now() - vendor.createdAt.getTime()) / (1000 * 60 * 60 * 24)))

      return {
        id: vendor.id,
        vendorId: vendor.id,
        type: venueVendor?.type || 'INDIVIDUAL_ENTREPRENEUR',
        status: vendorStatus,
        documentsStatus,
        documentsChecked: venueVendor?.documentsChecked || false,
        documentsCheckedAt: venueVendor?.documentsCheckedAt,
        documentsCheckedBy: venueVendor?.documentsCheckedBy,
        documentsCheckedByUser: venueVendor?.documentsCheckedByUser,
        fullName: venueVendor?.fullName,
        inn: venueVendor?.inn,
        orgnip: venueVendor?.orgnip,
        bankAccount: venueVendor?.bankAccount,
        bik: venueVendor?.bik,
        address: venueVendor?.address,
        isVatPayer: venueVendor?.isVatPayer || false,
        vatRate: venueVendor?.vatRate,
        egryulDocument: venueVendor?.egryulDocument,
        representativeName: venueVendor?.representativeName,
        representativePosition: venueVendor?.representativePosition,
        isRepresentative: venueVendor?.isRepresentative ?? false,
        companyName: venueVendor?.companyName,
        kpp: venueVendor?.kpp,
        orgn: venueVendor?.orgn,
        legalAddress: venueVendor?.legalAddress,
        actualAddress: venueVendor?.actualAddress,
        directorName: venueVendor?.directorName,
        directorPosition: venueVendor?.directorPosition,
        selfEmployedInn: venueVendor?.selfEmployedInn,
        agreementAccepted: venueVendor?.agreementAccepted ?? false,
        selfEmployedPassport: (venueVendor as any)?.selfEmployedPassport,
        selfEmployedPhone: (venueVendor as any)?.selfEmployedPhone,
        selfEmployedEmail: (venueVendor as any)?.selfEmployedEmail,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        vendor: {
          id: vendor.id,
          displayName: vendor.displayName,
          cityId: vendor.cityId,
          city: vendor.city,
          user: vendor.user
        },
        users: venueVendor?.users || [],
        daysUntilDeletion,
        partnerCount
      }
    })

    // Фильтруем по статусу если указан
    let filteredVendors = venueVendors
    if (status) {
      filteredVendors = venueVendors.filter(vendor => vendor.status === status)
    }

    return NextResponse.json({
      vendors: filteredVendors,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    logger.error('Failed to fetch vendors', {
      action: 'GET_VENDORS',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json({ 
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/venues/vendors - создать вендора
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    // Проверяем Content-Type для определения типа данных
    const contentType = request.headers.get('content-type') || ''
    
    let type, fullName, inn, orgnip, bankAccount, bik, address, isVatPayer, vatRate, 
        representativeName, representativePosition, isRepresentative, companyName, 
        kpp, orgn, legalAddress, actualAddress, directorName, directorPosition, selfEmployedInn, 
        egryulDocument, agreementAccepted
    
    if (contentType.includes('multipart/form-data')) {
      // Обрабатываем FormData
      const formData = await request.formData()
      type = formData.get('type') as string
      fullName = formData.get('fullName') as string
      inn = formData.get('inn') as string
      orgnip = formData.get('orgnip') as string
      bankAccount = formData.get('bankAccount') as string
      bik = formData.get('bik') as string
      address = formData.get('address') as string
      isVatPayer = formData.get('isVatPayer') === 'true'
      vatRate = formData.get('vatRate') as string
      representativeName = formData.get('representativeName') as string
      representativePosition = formData.get('representativePosition') as string
      isRepresentative = formData.get('isRepresentative') === 'true'
      companyName = formData.get('companyName') as string
      kpp = formData.get('kpp') as string
      orgn = formData.get('orgn') as string
      legalAddress = formData.get('legalAddress') as string
      actualAddress = formData.get('actualAddress') as string
      directorName = formData.get('directorName') as string
      directorPosition = formData.get('directorPosition') as string
      selfEmployedInn = formData.get('selfEmployedInn') as string
      egryulDocument = formData.get('egryulDocument') as File | null
      agreementAccepted = formData.get('agreementAccepted') === 'true'
    } else {
      // Обрабатываем JSON
      const body = await request.json()
      type = body.type
      fullName = body.fullName
      inn = body.inn
      orgnip = body.orgnip
      bankAccount = body.bankAccount
      bik = body.bik
      address = body.address
      isVatPayer = body.isVatPayer
      vatRate = body.vatRate
      representativeName = body.representativeName
      representativePosition = body.representativePosition
      isRepresentative = body.isRepresentative
      companyName = body.companyName
      kpp = body.kpp
      orgn = body.orgn
      legalAddress = body.legalAddress
      actualAddress = body.actualAddress
      directorName = body.directorName
      directorPosition = body.directorPosition
      selfEmployedInn = body.selfEmployedInn
      egryulDocument = null // JSON не поддерживает файлы
      agreementAccepted = body.agreementAccepted
    }

    // Обрабатываем загрузку файла
    let egryulDocumentPath = null
    if (egryulDocument && egryulDocument.size > 0) {
      // Здесь должна быть логика сохранения файла
      // Пока что просто сохраняем имя файла
      egryulDocumentPath = `documents/${Date.now()}-${egryulDocument.name}`
    }

    // Сначала создаем пользователя для вендора
    const user = await prisma.user.create({
      data: {
        email: `vendor-${Date.now()}@example.com`,
        name: fullName || companyName || 'Новый вендор',
        role: 'VENDOR'
      }
    })

    // Создаем базового вендора
    const baseVendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        displayName: fullName || companyName || 'Новый вендор',
        cityId: 1, // Москва
        canPostEvents: true,
        canPostCatalog: true,
        description: '',
        address: address || '',
        email: user.email,
        phone: '',
        website: ''
      }
    })

    // Создаем VenueVendor
    const vendor = await prisma.venueVendor.create({
      data: {
        vendorId: baseVendor.id,
        type: type as any,
        fullName: fullName || null,
        inn: inn || null,
        orgnip: orgnip || null,
        bankAccount: bankAccount || null,
        bik: bik || null,
        address: address || null,
        isVatPayer: isVatPayer || false,
        vatRate: vatRate ? parseInt(vatRate) : null,
        egryulDocument: egryulDocumentPath,
        representativeName: representativeName || null,
        representativePosition: representativePosition || null,
        isRepresentative: isRepresentative || false,
        companyName: companyName || null,
        kpp: kpp || null,
        orgn: orgn || null,
        legalAddress: legalAddress || null,
        actualAddress: actualAddress || null,
        directorName: directorName || null,
        directorPosition: directorPosition || null,
        selfEmployedInn: selfEmployedInn || null,
        agreementAccepted: agreementAccepted || false
      },
      include: {
        vendor: {
          include: {
            city: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(vendor)
  } catch (error) {
    logger.error('Failed to create vendor', {
      action: 'CREATE_VENDOR',
      metadata: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })
    return NextResponse.json({ 
      error: 'Failed to create vendor',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
