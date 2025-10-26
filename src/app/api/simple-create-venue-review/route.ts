import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addPoints, POINTS_CATEGORIES, POINTS_VALUES } from '@/lib/points'
// export const runtime = 'nodejs' // Убираем edge runtime для Prisma

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Starting review creation')
    const formData = await request.formData()
    const venueId = formData.get('venueId')
    const userId = formData.get('userId')
    const rating = formData.get('rating')
    const comment = formData.get('comment')
    const photos = formData.getAll('photos') as File[]

    console.log('🔍 API: Form data:', {
      venueId,
      userId,
      rating,
      comment: comment ? (comment as string).substring(0, 50) + '...' : null,
      photosCount: photos.length
    })

    if (!venueId || !userId || !rating) {
      console.log('❌ API: Missing required fields')
      return NextResponse.json({ 
        success: false,
        error: 'Не заполнены обязательные поля'
      }, { status: 400 })
    }

    if (parseInt(rating as string) < 1 || parseInt(rating as string) > 5) {
      return NextResponse.json({ 
        success: false,
        error: 'Оценка должна быть от 1 до 5' 
      }, { status: 400 })
    }

    if (photos.length > 10) {
      return NextResponse.json({ 
        success: false,
        error: 'Максимум 10 фотографий' 
      }, { status: 400 })
    }
    
    const validPhotos = photos.filter(photo => photo && photo.size > 0)

    const venue = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venueId as string) }
    })

    if (!venue) {
      return NextResponse.json({ 
        success: false,
        error: 'Место не найдено' 
      }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId as string) }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Пользователь не найден' 
      }, { status: 404 })
    }

    const existingReview = await prisma.venueReview.findFirst({
      where: {
        venueId: parseInt(venueId as string),
        userId: parseInt(userId as string)
      }
    })

    console.log('🔍 API: Checking existing review:', {
      venueId: parseInt(venueId as string),
      userId: parseInt(userId as string),
      existingReview: existingReview ? existingReview.id : null
    })

    if (existingReview) {
      console.log('❌ API: User already reviewed this venue')
      return NextResponse.json({ 
        success: false,
        error: 'Вы уже оставили отзыв на это место' 
      }, { status: 400 })
    }

    // Обрабатываем фотографии
    const photoUrls: string[] = []
    for (const photo of validPhotos) {
      try {
        const fileExtension = photo.name.split('.').pop() || 'jpg'
        const fileName = `venue-review-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
        const filePath = `public/${fileName}`
        
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const fs = require('fs')
        const path = require('path')
        
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(filePath, buffer)
        photoUrls.push(`/${fileName}`)
      } catch (error) {
        console.error('Error saving photo:', error)
      }
    }

    const review = await prisma.venueReview.create({
      data: {
        venueId: parseInt(venueId as string),
        userId: parseInt(userId as string),
        rating: parseInt(rating as string),
        comment: (comment as string) || null,
        status: 'MODERATION',
        photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Начисляем баллы за оценку места
    try {
      await addPoints({
        userId: parseInt(userId as string),
        points: POINTS_VALUES.RATE_VENUE,
        category: POINTS_CATEGORIES.RATE_VENUE,
        description: `Оценка места`,
        eventId: venueId as string
      })
    } catch (pointsError) {
      console.error('Error awarding points for venue rating:', pointsError)
    }

    return NextResponse.json({ 
      success: true, 
      review 
    })
  } catch (error) {
    console.error('❌ API: Error creating venue review:', error)
    console.error('❌ API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}
