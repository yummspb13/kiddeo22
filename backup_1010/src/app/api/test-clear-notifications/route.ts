import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('🔍 Clearing notifications for user:', userId)

    // Удаляем все уведомления пользователя
    const deletedNotifications = await prisma.userNotification.deleteMany({
      where: {
        userId: userId
      }
    })

    console.log('✅ Deleted notifications:', deletedNotifications.count)

    return NextResponse.json({ 
      success: true, 
      count: deletedNotifications.count 
    })
  } catch (error) {
    console.error('❌ Error clearing notifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
