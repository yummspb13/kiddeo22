import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { syncVenuePartnerWithListing } from '@/lib/venue-sync'
import { generateUniqueSlug, checkVenuePartnerSlugExists } from '@/lib/slug-utils'
export const runtime = 'nodejs'

// POST /api/vendor/venues - создать новое место
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь является вендором
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ 
        error: 'Пользователь не является вендором' 
      }, { status: 400 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const subcategoryId = formData.get('subcategoryId') as string
    const cityId = formData.get('cityId') as string
    const description = formData.get('description') as string
    const coverImage = formData.get('coverImage') as File | null
    
    // Получаем дополнительные изображения
    const additionalImages: File[] = []
    for (let i = 0; i < 4; i++) {
      const image = formData.get(`additionalImage${i}`) as File | null
      if (image && image.size > 0) {
        additionalImages.push(image)
      }
    }
    
    // Дополнительные поля адреса
    const district = formData.get('district') as string
    const metro = formData.get('metro') as string
    const lat = formData.get('lat') as string
    const lng = formData.get('lng') as string
    const timezone = formData.get('timezone') as string
    const fiasId = formData.get('fiasId') as string
    const kladrId = formData.get('kladrId') as string
    const workingHours = formData.get('workingHours') as string

    // Валидация
    if (!name || !subcategoryId || !cityId) {
      return NextResponse.json({ 
        error: 'Обязательные поля: name, subcategoryId, cityId' 
      }, { status: 400 })
    }

    // Проверяем, что подкатегория существует
    const subcategory = await prisma.venueSubcategory.findUnique({
      where: { id: parseInt(subcategoryId) },
      include: {
        category: {
          select: {
            id: true
          }
        }
      }
    })

    if (!subcategory) {
      return NextResponse.json({ 
        error: 'Подкатегория не найдена' 
      }, { status: 400 })
    }

    // Проверяем, что город существует
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    })

    if (!city) {
      return NextResponse.json({ 
        error: 'Город не найден' 
      }, { status: 400 })
    }

    // Создаем уникальный slug из названия
    const slug = await generateUniqueSlug(name, checkVenuePartnerSlugExists)

    // Обработка изображений
    let coverImagePath: string | null = null
    const additionalImagePaths: string[] = []

    if (coverImage && coverImage.size > 0) {
      const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer())
      const coverImageExt = path.extname(coverImage.name)
      const coverImageName = `${uuidv4()}${coverImageExt}`
      const coverImageDir = path.join(process.cwd(), 'public', 'venues', 'cover')
      
      await mkdir(coverImageDir, { recursive: true })
      await writeFile(path.join(coverImageDir, coverImageName), coverImageBuffer)
      coverImagePath = `/venues/cover/${coverImageName}`
    }

    // Обрабатываем дополнительные изображения
    for (const image of additionalImages) {
      const imageBuffer = Buffer.from(await image.arrayBuffer())
      const imageExt = path.extname(image.name)
      const imageName = `${uuidv4()}${imageExt}`
      const imageDir = path.join(process.cwd(), 'public', 'venues', 'additional')
      
      await mkdir(imageDir, { recursive: true })
      await writeFile(path.join(imageDir, imageName), imageBuffer)
      additionalImagePaths.push(`/venues/additional/${imageName}`)
    }

    // Создаем место
    const venue = await prisma.venuePartner.create({
      data: {
        name,
        slug,
        description: description || null, // Добавляем сохранение описания
        address: address || null,
        district: district || null,
        metro: metro || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        timezone: timezone || null,
        fiasId: fiasId || null,
        kladrId: kladrId || null,
        workingHours: workingHours || null,
        coverImage: coverImagePath,
        additionalImages: JSON.stringify(additionalImagePaths),
        subcategoryId: parseInt(subcategoryId),
        vendorId: vendor.id,
        cityId: parseInt(cityId),
        status: 'MODERATION', // Отправляем на модерацию
        moderationReason: null
      },
      include: {
        subcategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        city: {
          select: {
            name: true
          }
        }
      }
    })

    // Синхронизируем с Listing (для статуса MODERATION - удаляем из публичного каталога)
    try {
      await syncVenuePartnerWithListing(venue.id)
    } catch (syncError) {
      console.error('Ошибка синхронизации с Listing:', syncError)
      // Не прерываем создание VenuePartner из-за ошибки синхронизации
    }

    return NextResponse.json({ 
      success: true, 
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        status: venue.status,
        subcategory: venue.subcategory,
        city: venue.city
      },
      message: 'Место создано и отправлено на модерацию'
    })

  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/vendor/venues - получить места вендора
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь является вендором
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ 
        error: 'Пользователь не является вендором' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = { vendorId: vendor.id }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.subcategory = {
        type: type
      }
    }

    const venues = await prisma.venuePartner.findMany({
      where,
      include: {
        subcategory: {
          select: {
            name: true,
            slug: true,
            type: true
          }
        },
        city: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ venues })

  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
