import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Starting notifications fetch...')
    console.log('🔍 API: Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 API: Request cookies:', request.cookies.getAll())
    
    const session = await getServerSession(request)
    console.log('🔍 API: Session data:', {
      hasSession: !!session,
      userId: (session?.user as any)?.id,
      uid: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })
    
    // Используем uid вместо id, так как в нашей конфигурации NextAuth используется uid
    const userId = session?.user?.id || (session?.user as any)?.id
    
    if (!userId) {
      console.log('❌ API: No user ID (uid or id) found in session')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ API: Session found, fetching notifications for user:', userId)

    const notifications = await prisma.userNotification.findMany({
      where: {
        userId: parseInt(String(userId)),
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📋 API: Found notifications:', notifications.length)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('❌ API: Error fetching notifications:', error)
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 })
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

    const { notificationId, action } = await request.json()

    if (action === 'markAsRead') {
      await prisma.userNotification.update({
        where: { id: notificationId },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      })
    } else if (action === 'markAllAsRead') {
      await prisma.userNotification.updateMany({
        where: { 
          userId: parseInt(String(userId)),
          isRead: false
        },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      })
    } else if (action === 'delete') {
      await prisma.userNotification.update({
        where: { id: notificationId },
        data: { isActive: false }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ message: 'Error updating notification' }, { status: 500 })
  }
}