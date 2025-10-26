import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { syncVenuePartnerWithListing } from '@/lib/venue-sync'
import { generateUniqueSlug, checkVenuePartnerSlugExists } from '@/lib/slug-utils'
export const runtime = 'nodejs'

// GET /api/vendor/venues/[id] - получить место
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем вендора
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const { id } = await params
    const venueId = id
    
    // Получаем место
    const venue = await prisma.venuePartner.findFirst({
      where: {
        id: parseInt(venueId),
        vendorId: vendor.id
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
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json({ venue })

  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// PATCH /api/vendor/venues/[id] - обновить место
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 PATCH /api/vendor/venues/[id] - начало обработки')
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 Request cookies:', request.cookies.getAll())
    
    const session = await getServerSession(request)
    console.log('🔍 Session result:', session ? `user: ${session.user.id}` : 'null')
    
    if (!session?.user?.id) {
      console.log('❌ No session or user.id, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем вендора
    console.log('Ищем вендора для userId:', session.user.id)
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })
    console.log('Vendor found:', vendor ? 'yes' : 'no')

    if (!vendor) {
      console.log('Vendor not found')
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const { id } = await params
    const venueId = id
    console.log('Venue ID:', venueId)
    
    // Проверяем, что место принадлежит вендору
    const existingVenue = await prisma.venuePartner.findFirst({
      where: {
        id: parseInt(venueId),
        vendorId: vendor.id
      }
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const subcategoryId = formData.get('subcategoryId') as string
    const cityId = formData.get('cityId') as string
    const description = formData.get('description') as string
    const coverImage = formData.get('coverImage') as File | null
    
    console.log('PATCH /api/vendor/venues/[id] - данные:', {
      name,
      address,
      subcategoryId,
      cityId,
      description,
      coverImageSize: coverImage?.size || 0
    })
    
    console.log('Проверяем обязательные поля...')
    
    // Получаем дополнительные изображения
    const additionalImages: File[] = []
    for (let i = 0; i < 4; i++) {
      const image = formData.get(`additionalImage${i}`) as File | null
      if (image && image.size > 0) {
        additionalImages.push(image)
      }
    }
    
    console.log('Дополнительные изображения:', additionalImages.length)
    
    // Дополнительные поля адреса
    const district = formData.get('district') as string
    const metro = formData.get('metro') as string
    const lat = formData.get('lat') as string
    const lng = formData.get('lng') as string
    const timezone = formData.get('timezone') as string
    const fiasId = formData.get('fiasId') as string
    const kladrId = formData.get('kladrId') as string

    // Валидация
    if (!name || !subcategoryId || !cityId) {
      return NextResponse.json({ 
        error: 'Обязательные поля: name, subcategoryId, cityId' 
      }, { status: 400 })
    }

    // Проверяем подкатегорию
    const subcategory = await prisma.venueSubcategory.findUnique({
      where: { id: parseInt(subcategoryId) }
    })

    if (!subcategory) {
      return NextResponse.json({ 
        error: 'Подкатегория не найдена' 
      }, { status: 400 })
    }

    // Проверяем город
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    })

    if (!city) {
      return NextResponse.json({ 
        error: 'Город не найден' 
      }, { status: 400 })
    }

    // Создаем уникальный slug из названия (если название изменилось)
    let slug = existingVenue.slug
    if (name !== existingVenue.name) {
      // slug = await generateUniqueSlug(name, checkVenuePartnerSlugExists)
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      console.log('Generated slug:', slug)
    }

    // Обработка изображений
    let coverImagePath = existingVenue.coverImage
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
    if (additionalImages && additionalImages.length > 0) {
      for (const image of additionalImages) {
        if (image && image.size > 0) {
          const imageBuffer = Buffer.from(await image.arrayBuffer())
          const imageExt = path.extname(image.name)
          const imageName = `${uuidv4()}${imageExt}`
          const imageDir = path.join(process.cwd(), 'public', 'venues', 'additional')
          
          await mkdir(imageDir, { recursive: true })
          await writeFile(path.join(imageDir, imageName), imageBuffer)
          additionalImagePaths.push(`/venues/additional/${imageName}`)
        }
      }
    }

    // Получаем существующие дополнительные изображения
    let existingAdditionalImages: string[] = []
    if (existingVenue.additionalImages) {
      try {
        existingAdditionalImages = JSON.parse(existingVenue.additionalImages)
      } catch (error) {
        console.error('Error parsing existing additional images:', error)
      }
    }

    // Если есть новые изображения, добавляем их к существующим
    // Если новых изображений нет, оставляем существующие
    const allAdditionalImages = additionalImagePaths.length > 0 
      ? [...existingAdditionalImages, ...additionalImagePaths]
      : existingAdditionalImages

    // Обновляем место
    const venue = await prisma.venuePartner.update({
      where: { id: parseInt(venueId) },
      data: {
        name,
        slug,
        address: address || null,
        district: district || null,
        metro: metro || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        timezone: timezone || null,
        fiasId: fiasId || null,
        kladrId: kladrId || null,
        coverImage: coverImagePath,
        additionalImages: JSON.stringify(allAdditionalImages),
        subcategoryId: parseInt(subcategoryId),
        cityId: parseInt(cityId),
        description: description || null,
        status: 'MODERATION' // Отправляем на модерацию после изменения
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
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Синхронизируем с Listing
    await syncVenuePartnerWithListing(venue.id)

    return NextResponse.json({
      success: true,
      venue
    })

  } catch (error) {
    console.error('Error updating venue:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// DELETE /api/vendor/venues/[id] - удалить место
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем вендора
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const { id } = await params
    const venueId = id
    
    // Проверяем, что место принадлежит вендору
    const existingVenue = await prisma.venuePartner.findFirst({
      where: {
        id: parseInt(venueId),
        vendorId: vendor.id
      }
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Удаляем место
    await prisma.venuePartner.delete({
      where: { id: parseInt(venueId) }
    })

    // Синхронизируем с Listing (удаляем из публичного каталога)
    await syncVenuePartnerWithListing(parseInt(venueId))

    return NextResponse.json({
      success: true,
      message: 'Venue deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
