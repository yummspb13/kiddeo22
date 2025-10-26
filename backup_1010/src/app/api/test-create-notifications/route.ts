import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { notifications } = await request.json()
    
    console.log('🔍 Creating test notifications:', notifications.length)

    // Создаем уведомления в базе данных
    const createdNotifications = await prisma.userNotification.createMany({
      data: notifications.map((notification: any) => ({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        isActive: notification.isActive
      }))
    })

    console.log('✅ Created notifications:', createdNotifications.count)

    return NextResponse.json({ 
      success: true, 
      count: createdNotifications.count 
    })
  } catch (error) {
    console.error('❌ Error creating test notifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
