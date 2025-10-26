import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/dev/set-admin - установить роль ADMIN для пользователя (только для разработки)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Обновляем роль пользователя на ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Роль пользователя ${updatedUser.name} изменена на ADMIN`
    });

  } catch (error) {
    console.error('Error setting admin role:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
