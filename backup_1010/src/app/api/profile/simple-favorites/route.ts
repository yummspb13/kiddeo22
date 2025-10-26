import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFavorites, addFavorite } from '@/lib/favorites-persistent'

// GET - получить список избранного
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-favorites - UserId:', userId)

    // Получаем избранное из временного хранилища
    const favorites = getFavorites(parseInt(userId))

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

    const { itemId, itemType, title, description, image, price, currency, location, date } = await request.json()

    if (!itemId || !itemType) {
      return NextResponse.json({ 
        error: 'Item ID and type are required' 
      }, { status: 400 })
    }

    console.log('🔍 POST /api/profile/simple-favorites - UserId:', userId, 'Data:', { itemId, itemType, title })

    // Создаем объект избранного
    const favorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemType,
      title: title || 'Без названия',
      description: description || null,
      image: image || null,
      price: price || null,
      currency: currency || 'RUB',
      location: location || null,
      date: date || null,
      userId: parseInt(userId),
      createdAt: new Date().toISOString()
    }

    // Сохраняем в временное хранилище
    addFavorite(parseInt(userId), favorite)

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
