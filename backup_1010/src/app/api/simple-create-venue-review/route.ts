import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const venueId = formData.get('venueId')
    const userId = formData.get('userId')
    const rating = formData.get('rating')
    const comment = formData.get('comment')
    const photos = formData.getAll('photos') as File[]

    if (!venueId || !userId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (parseInt(rating as string) < 1 || parseInt(rating as string) > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (photos.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 photos allowed' }, { status: 400 })
    }

    // Проверяем, существует ли место
    const venue = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venueId as string) }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId as string) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на это место
    const existingReview = await prisma.venueReview.findFirst({
      where: {
        venueId: parseInt(venueId as string),
        userId: parseInt(userId as string)
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this venue' }, { status: 400 })
    }

    // Обрабатываем фотографии
    const photoUrls: string[] = []
    for (const photo of photos) {
      if (photo.size > 0) {
        try {
          // Создаем уникальное имя файла
          const fileExtension = photo.name.split('.').pop() || 'jpg'
          const fileName = `venue-review-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
          const filePath = `public/${fileName}`
          
          // Конвертируем File в Buffer и сохраняем
          const bytes = await photo.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Сохраняем файл
          const fs = require('fs')
          const path = require('path')
          
          // Убеждаемся, что папка существует
          const dir = path.dirname(filePath)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          
          fs.writeFileSync(filePath, buffer)
          photoUrls.push(`/${fileName}`)
        } catch (error) {
          console.error('Error saving photo:', error)
          // Продолжаем без этой фотографии
        }
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

    return NextResponse.json({ 
      success: true, 
      review 
    })
  } catch (error) {
    console.error('Error creating venue review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
