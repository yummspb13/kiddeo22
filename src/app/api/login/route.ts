import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, setAuthCookies } from '@/lib/auth-session';
import bcrypt from 'bcryptjs';

// Простой кэш для быстрого доступа
const userCache = new Map();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password required' 
      }, { status: 400 });
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Создаем сессию с refresh token
    const userData = {
      id: user.id.toString(),
      email: user.email,
      name: user.name || user.email,
      role: user.role.toString()
    };

    const { accessToken, refreshToken } = await createSession(userData);

    // Устанавливаем cookies
    const response = NextResponse.json({ 
      success: true, 
      user: userData
    });

    setAuthCookies(response, accessToken, refreshToken);

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
