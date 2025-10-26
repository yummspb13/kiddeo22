import { NextRequest, NextResponse } from 'next/server'
import { getToken } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET - получить список детей
export async function GET(request: NextRequest) {
  try {
    const token = await getToken(request)
    
    console.log('🔍 GET /api/profile/children - Token:', {
      hasToken: !!token,
      userId: token?.sub,
      userEmail: token?.email
    })
    
    if (!token?.sub) {
      console.log('❌ Unauthorized: No token or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(token.sub)

    const children = await prisma.userChild.findMany({
      where: { userId },
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
    const token = await getToken(request)
    
    console.log('🔍 POST /api/profile/children - Token:', {
      hasToken: !!token,
      userId: token?.sub,
      userEmail: token?.email
    })
    
    if (!token?.sub) {
      console.log('❌ Unauthorized: No token or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, birthDate, gender } = await request.json()

    if (!name || !birthDate) {
      return NextResponse.json({ 
        error: 'Name and birth date are required' 
      }, { status: 400 })
    }

    const userId = parseInt(token.sub)

    const child = await prisma.userChild.create({
      data: {
        userId,
        name: name.trim(),
        birthDate: new Date(birthDate),
        gender: gender || null
      } as any
    })

    return NextResponse.json({ child })
  } catch (error) {
    console.error('Error creating child:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
