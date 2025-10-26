import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addPoints, POINTS_CATEGORIES, POINTS_VALUES } from '@/lib/points'

export const runtime = 'nodejs'

// POST - Использовать реферальную ссылку
export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userId } = await request.json()
    
    if (!inviteCode || !userId) {
      return NextResponse.json({ error: 'Invite code and user ID required' }, { status: 400 })
    }

    console.log('🔍 POST /api/referral/use - InviteCode:', inviteCode, 'UserId:', userId)

    // Проверяем, существует ли код приглашения
    const invite = await prisma.userInvite.findFirst({
      where: {
        inviteCode: inviteCode,
        isUsed: false
      }
    })

    if (!invite) {
      return NextResponse.json({ 
        error: 'Неверный код приглашения или ссылка уже использована' 
      }, { status: 400 })
    }

    // Проверяем, что пользователь не приглашает сам себя
    if (invite.inviterId === parseInt(userId)) {
      return NextResponse.json({ 
        error: 'Нельзя использовать собственную реферальную ссылку' 
      }, { status: 400 })
    }

    // Проверяем, не использовал ли уже этот пользователь какую-либо реферальную ссылку
    const existingInvite = await prisma.userInvite.findFirst({
      where: {
        inviteeId: parseInt(userId)
      }
    })

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'Вы уже использовали реферальную ссылку' 
      }, { status: 400 })
    }

    // Обновляем запись о приглашении
    await prisma.userInvite.update({
      where: { id: invite.id },
      data: {
        inviteeId: parseInt(userId),
        isUsed: true,
        usedAt: new Date()
      }
    })

    // Начисляем баллы приглашающему
    try {
      const pointsResult = await addPoints({
        userId: invite.inviterId,
        points: POINTS_VALUES.INVITE_FRIEND,
        category: POINTS_CATEGORIES.INVITE_FRIEND,
        description: `Приглашение друга по реферальной ссылке`
      })
      
      if (pointsResult.success) {
        console.log('✅ Points awarded for referral:', POINTS_VALUES.INVITE_FRIEND)
      } else {
        console.error('❌ Error awarding referral points:', pointsResult.error)
      }
    } catch (pointsError) {
      console.error('Error awarding referral points:', pointsError)
    }

    console.log('✅ Referral code used successfully')

    return NextResponse.json({
      success: true,
      message: 'Реферальная ссылка успешно использована! Вам начислены бонусы.'
    })
  } catch (error) {
    console.error('Error using referral code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
