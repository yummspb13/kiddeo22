import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { withPrismaTimeout, ApiTimeoutError } from '@/lib/api-timeout'
import { handleApiError } from '@/lib/api-error-handler'
export const runtime = 'nodejs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  console.log(`[API] ===== VENUE UPDATE START =====`)
  
  try {
    const { id } = await params
    console.log(`[API] Starting venue update for ID: ${id} at ${new Date().toISOString()}`)
    
    const session = await getServerSession(request)
    console.log(`[API] Session check completed in ${Date.now() - startTime}ms`)
    console.log(`[API] Session data:`, session)
    
    if (!session?.user?.id) {
      console.log(`[API] Unauthorized request - no session`)
      console.log(`[API] Request headers:`, Object.fromEntries(request.headers.entries()))
      console.log(`[API] Request cookies:`, request.cookies.getAll())
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log(`[API] User ID: ${session.user.id}`)

    // Получаем вендора без таймаута
    console.log(`[API] Looking up vendor for user ${session.user.id}`)
    const vendorStartTime = Date.now()
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) },
      select: { id: true }
    })
    console.log(`[API] Vendor lookup completed in ${Date.now() - vendorStartTime}ms`)

    if (!vendor) {
      console.log(`[API] Vendor not found for user ${session.user.id}`)
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    console.log(`[API] Found vendor ID: ${vendor.id}`)

    // Проверяем, что место принадлежит вендору
    console.log(`[API] Looking up venue ${id} for vendor ${vendor.id}`)
    const venueStartTime = Date.now()
    const venue = await prisma.venuePartner.findFirst({
      where: {
        id: parseInt(id),
        vendorId: vendor.id
      }
    })
    console.log(`[API] Venue lookup completed in ${Date.now() - venueStartTime}ms`)

    if (!venue) {
      console.log(`[API] Venue ${id} not found or not owned by vendor ${vendor.id}`)
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    console.log(`[API] Found venue: ${venue.name}`)

    console.log(`[API] Starting to parse request body...`)
    const body = await request.json()
    console.log(`[API] Request body parsed in ${Date.now() - startTime}ms`)
    console.log(`[API] Body size: ${JSON.stringify(body).length} characters`)
    
    const {
      name,
      description,
      address,
      district,
      metro,
      coordinates,
      priceFrom,
      ageFrom,
      workingHours,
      richDescription,
      newImages,
      additionalImages // Добавляем обработку обновленного списка изображений
    } = body

    console.log(`[API] Updating venue with data:`, { name, description, address, district, metro, coordinates, newImagesCount: newImages?.length || 0 })

    // Обрабатываем изображения
    let updatedAdditionalImages = venue.additionalImages ? JSON.parse(venue.additionalImages as string) : []
    
    // Если передан обновленный список существующих изображений, используем его
    if (additionalImages) {
      console.log(`[API] Using updated additional images list: ${additionalImages.length} images`)
      updatedAdditionalImages = additionalImages
    }
    
    // Ограничиваем количество фото по тарифу
    const maxImages = venue.tariff === 'FREE' ? 4 : 10
    let limitedAdditional = updatedAdditionalImages.slice(0, maxImages)

    const remainingSlots = Math.max(0, maxImages - limitedAdditional.length)

    if (newImages && newImages.length > 0 && remainingSlots > 0) {
      console.log(`[API] Processing ${newImages.length} new images`)
      
      // Обрабатываем base64 изображения
      const processedImages = []
      for (let index = 0; index < newImages.length; index++) {
        const base64Image = newImages[index]
        
        // Генерируем уникальное имя файла
        const timestamp = Date.now()
        const filename = `venue_${venue.id}_${timestamp}_${index}.webp`
        const filePath = `/venues/additional/${filename}`
        
        try {
          // Сохраняем base64 изображение на диск
          const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')
          
          // Создаем директорию если не существует
          const fs = require('fs')
          const path = require('path')
          const publicDir = path.join(process.cwd(), 'public', 'venues', 'additional')
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true })
          }
          
          // Сохраняем файл
          const fullPath = path.join(publicDir, filename)
          fs.writeFileSync(fullPath, buffer)
          
          processedImages.push(filePath)
          console.log(`[API] Saved image ${index + 1}/${newImages.length}: ${filePath}`)
        } catch (error) {
          console.error(`[API] Error saving image ${index + 1}:`, error)
          // Продолжаем обработку остальных изображений
        }
      }
      
      // Берем только доступное количество
      const limitedProcessed = processedImages.slice(0, remainingSlots)
      updatedAdditionalImages = [...limitedAdditional, ...limitedProcessed]
      console.log(`[API] Updated additional images count: ${updatedAdditionalImages.length}`)
    }
    // Если превысили, усекаем
    if (updatedAdditionalImages.length > maxImages) {
      updatedAdditionalImages = updatedAdditionalImages.slice(0, maxImages)
    }

    // Парсим координаты
    let lat = venue.lat
    let lng = venue.lng
    
    if (coordinates) {
      const coords = coordinates.split(',').map(coord => coord.trim())
      if (coords.length === 2) {
        lat = parseFloat(coords[0])
        lng = parseFloat(coords[1])
        console.log(`[API] Parsed coordinates: lat=${lat}, lng=${lng}`)
      }
    }

    // Обновляем место без таймаута
    console.log(`[API] Starting venue update in database`)
    const updateStartTime = Date.now()
    const updatedVenue = await prisma.venuePartner.update({
      where: { id: parseInt(id) },
      data: {
        name: name || venue.name,
        description: description || venue.description,
        address: address || venue.address,
        district: district || venue.district,
        metro: metro || venue.metro,
        lat: lat,
        lng: lng,
        priceFrom: typeof priceFrom === 'number' ? priceFrom : priceFrom ? parseInt(priceFrom) : venue.priceFrom,
        ageFrom: typeof ageFrom === 'number' ? ageFrom : ageFrom ? parseInt(ageFrom) : venue.ageFrom,
        workingHours: workingHours || venue.workingHours,
        richDescription: richDescription || venue.richDescription,
        additionalImages: JSON.stringify(updatedAdditionalImages),
        updatedAt: new Date()
      }
    })
    console.log(`[API] Database update completed in ${Date.now() - updateStartTime}ms`)

    const totalTime = Date.now() - startTime
    console.log(`[API] ===== VENUE UPDATE SUCCESS ===== Total time: ${totalTime}ms`)

    return NextResponse.json({ 
      success: true, 
      venue: updatedVenue 
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.log(`[API] ===== VENUE UPDATE ERROR ===== Total time: ${totalTime}ms`)
    console.error(`[API] Error details:`, error)
    return handleApiError(error, 'VENUE_UPDATE')
  }
}
