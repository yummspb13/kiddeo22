import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    // Используем uid вместо id
    const userId = session?.user?.id || (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(String(userId)) },
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
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ message: 'Error fetching user settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    // Используем uid вместо id
    const userId = session?.user?.id || (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, image } = await request.json()

    const user = await prisma.user.update({
      where: { id: parseInt(String(userId)) },
      data: {
        name,
        email,
        image
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
    return NextResponse.json({ message: 'Error updating user settings' }, { status: 500 })
  }
}
