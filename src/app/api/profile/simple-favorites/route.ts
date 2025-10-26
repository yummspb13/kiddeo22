import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFavorites, addFavorite } from '@/lib/favorites-persistent'
export const runtime = 'nodejs'

// GET - получить список избранного
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-favorites - UserId:', userId)

    // Получаем избранное из базы данных
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - добавить в избранное
export async function POST(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { itemId, itemType, title, description, image, price, currency, location, date, endDate } = await request.json()

    if (!itemId || !itemType) {
      return NextResponse.json({ 
        error: 'Item ID and type are required' 
      }, { status: 400 })
    }

    console.log('🔍 POST /api/profile/simple-favorites - UserId:', userId, 'Data:', { itemId, itemType, title })

    // Проверяем, не существует ли уже такое избранное
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: parseInt(userId),
        itemId,
        itemType
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ 
        error: 'Item already in favorites' 
      }, { status: 409 })
    }

    // Создаем объект избранного в базе данных
    const favorite = await prisma.favorite.create({
      data: {
        itemId,
        itemType,
        title: title || 'Без названия',
        description: description || null,
        image: image || null,
        price: price || null,
        currency: currency || 'RUB',
        location: location || null,
        date: date || null,
        endDate: endDate || null,
        userId: parseInt(userId)
      }
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
