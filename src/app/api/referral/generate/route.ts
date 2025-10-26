import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addPoints, POINTS_CATEGORIES, POINTS_VALUES } from '@/lib/points'

export const runtime = 'nodejs'

// POST - Создать реферальную ссылку
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 POST /api/referral/generate - UserId:', userId)

    // Проверяем, есть ли уже активная реферальная ссылка
    const existingInvite = await prisma.userInvite.findFirst({
      where: {
        inviterId: parseInt(userId),
        isUsed: false
      }
    })

    if (existingInvite) {
      return NextResponse.json({
        success: true,
        inviteCode: existingInvite.inviteCode,
        message: 'У вас уже есть активная реферальная ссылка'
      })
    }

    // Генерируем уникальный код приглашения
    const inviteCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Создаем запись о приглашении
    const invite = await prisma.userInvite.create({
      data: {
        inviterId: parseInt(userId),
        inviteCode: inviteCode,
        email: null
      }
    })

    console.log('✅ Referral code generated:', inviteCode)

    return NextResponse.json({
      success: true,
      inviteCode: inviteCode,
      message: 'Реферальная ссылка создана'
    })
  } catch (error) {
    console.error('Error generating referral code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Получить реферальную ссылку пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/referral/generate - UserId:', userId)

    // Ищем активную реферальную ссылку
    const invite = await prisma.userInvite.findFirst({
      where: {
        inviterId: parseInt(userId),
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!invite) {
      return NextResponse.json({
        success: true,
        inviteCode: null,
        message: 'У вас нет активной реферальной ссылки'
      })
    }

    return NextResponse.json({
      success: true,
      inviteCode: invite.inviteCode,
      message: 'Реферальная ссылка найдена'
    })
  } catch (error) {
    console.error('Error getting referral code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
