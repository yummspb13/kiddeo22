import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить список детей
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-children - UserId:', userId)

    const children = await prisma.userChild.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - добавить ребенка
export async function POST(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { name, birthDate, gender } = await request.json()

    if (!name || !birthDate) {
      return NextResponse.json({ 
        error: 'Name and birth date are required' 
      }, { status: 400 })
    }

    console.log('🔍 POST /api/profile/simple-children - UserId:', userId, 'Data:', { name, birthDate, gender })

    const child = await prisma.userChild.create({
      data: {
        userId: parseInt(userId),
        name: name.trim(),
        birthDate: new Date(birthDate),
        gender: gender || 'unknown',
        updatedAt: new Date()
      }
    })

    // Создаем активность
    await prisma.userBehaviorEvent.create({
      data: {
        userId: parseInt(userId),
        sessionId: 'profile-action',
        eventType: 'child_added',
        page: '/profile',
        element: 'children-manager',
        data: {
          childId: child.id,
          childName: child.name,
          childGender: child.gender
        },
        userAgent: 'Kiddeo App',
        ipAddress: '127.0.0.1'
      }
    })

    return NextResponse.json({ child })
  } catch (error) {
    console.error('Error creating child:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
