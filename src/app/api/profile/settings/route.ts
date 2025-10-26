import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET - получить настройки пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/settings - UserId:', userId)

    // Получаем настройки пользователя
    let settings = await prisma.userSettings.findUnique({
      where: { userId: parseInt(userId) }
    })

    // Создаем настройки по умолчанию, если их нет
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: parseInt(userId),
          theme: 'light',
          language: 'ru',
          notifications: true,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - обновить настройки пользователя
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { theme, language, notifications, emailNotifications, pushNotifications, marketingEmails } = await request.json()

    console.log('🔍 PUT /api/profile/settings - UserId:', userId, 'Settings:', { theme, language, notifications })

    // Обновляем настройки пользователя
    const settings = await prisma.userSettings.upsert({
      where: { userId: parseInt(userId) },
      update: {
        theme: theme || 'light',
        language: language || 'ru',
        notifications: notifications !== undefined ? notifications : true,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        marketingEmails: marketingEmails !== undefined ? marketingEmails : false,
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(userId),
        theme: theme || 'light',
        language: language || 'ru',
        notifications: notifications !== undefined ? notifications : true,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        marketingEmails: marketingEmails !== undefined ? marketingEmails : false
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}