import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken, deleteSession, clearAuthCookies } from '@/lib/auth-session';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('session')?.value;
    
    // Получаем данные сессии для удаления из БД
    let userId: number | null = null;
    if (accessToken) {
      const sessionData = await getSessionFromToken(accessToken);
      if (sessionData.sessionId) {
        userId = sessionData.userId;
        await deleteSession(sessionData.sessionId);
      }
    }

    // Очищаем корзину пользователя при выходе
    if (userId) {
      try {
        await prisma.cart.deleteMany({
          where: {
            userId: userId
          }
        });
        console.log(`🧹 Logout: Cleared cart for user ${userId}`);
      } catch (error) {
        console.error('Error clearing cart on logout:', error);
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Очищаем все cookies аутентификации
    clearAuthCookies(response);

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
