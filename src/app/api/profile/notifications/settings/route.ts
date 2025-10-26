import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    // Используем uid вместо id
    const userId = session?.user?.id || (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: parseInt(String(userId)) }
    })

    // Создаем настройки по умолчанию, если их нет
    if (!settings) {
      settings = await prisma.userNotificationSettings.create({
        data: {
          userId: parseInt(String(userId)),
          emailNewEvents: true,
          emailPriceDrops: true,
          emailReminders: true,
          emailReviews: true,
          emailNewsletter: true,
          pushNewEvents: true,
          pushPriceDrops: false,
          pushReminders: true,
          pushReviews: true,
          frequency: 'daily',
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ message: 'Error fetching notification settings' }, { status: 500 })
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

    const settingsData = await request.json()

    const settings = await prisma.userNotificationSettings.upsert({
      where: { userId: parseInt(String(userId)) },
      update: {
        ...settingsData,
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(String(userId)),
        ...settingsData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({ message: 'Error updating notification settings' }, { status: 500 })
  }
}