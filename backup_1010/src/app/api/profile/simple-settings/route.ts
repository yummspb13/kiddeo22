import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить настройки профиля
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-settings - UserId:', userId)

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - обновить настройки профиля
export async function PUT(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Name and email are required' 
      }, { status: 400 })
    }

    console.log('🔍 PUT /api/profile/simple-settings - UserId:', userId, 'Data:', { name, email })

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
