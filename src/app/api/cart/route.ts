import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartItem } from '@/contexts/CartContext'

export const runtime = 'nodejs'

// GET - получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const city = request.nextUrl.searchParams.get('city') || 'moskva'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/cart - UserId:', userId, 'City:', city)

    // Получаем корзину из базы данных
    const cart = await prisma.cart.findUnique({
      where: {
        userId_city: {
          userId: parseInt(userId),
          city: city
        }
      }
    })

    if (!cart) {
      return NextResponse.json({
        items: [],
        total: 0,
        itemCount: 0,
        lastUpdated: new Date().toISOString()
      })
    }

    const items: CartItem[] = JSON.parse(cart.items)
    
    // Пересчитываем itemCount на основе реальных товаров
    const realItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const realTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return NextResponse.json({
      items,
      total: realTotal,
      itemCount: realItemCount,
      lastUpdated: cart.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - сохранить корзину пользователя
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const city = request.nextUrl.searchParams.get('city') || 'moskva'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { items, total, itemCount } = await request.json()

    console.log('🔍 POST /api/cart - UserId:', userId, 'City:', city, 'Items:', items.length)

    // Сохраняем или обновляем корзину в базе данных
    const cart = await prisma.cart.upsert({
      where: {
        userId_city: {
          userId: parseInt(userId),
          city: city
        }
      },
      update: {
        items: JSON.stringify(items),
        total: total,
        itemCount: itemCount,
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(userId),
        city: city,
        items: JSON.stringify(items),
        total: total,
        itemCount: itemCount
      }
    })

    return NextResponse.json({ success: true, cart })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - очистить корзину пользователя
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const city = request.nextUrl.searchParams.get('city') || 'moskva'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/cart - UserId:', userId, 'City:', city)

    // Удаляем корзину из базы данных
    await prisma.cart.deleteMany({
      where: {
        userId: parseInt(userId),
        city: city
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}