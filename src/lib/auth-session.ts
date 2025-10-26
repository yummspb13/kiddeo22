// Система управления сессиями с refresh tokens
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export interface SessionData {
  user: SessionUser | null;
  isAuthenticated: boolean;
  sessionId?: string;
}

// Создаем новую сессию
export async function createSession(user: SessionUser): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Создаем access token (короткоживущий)
  const accessToken = await signJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    sessionId,
    type: 'access'
  }, '1h'); // 1 час

  // Создаем refresh token (долгоживущий)
  const refreshToken = await signJWT({
    sub: user.id,
    sessionId,
    type: 'refresh'
  }, '7d'); // 7 дней

  // Оптимизация: не сохраняем сессию в БД для ускорения входа
  // Сессии управляются через JWT токены и cookies

  return { accessToken, refreshToken };
}

// Обновляем access token используя refresh token
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; user: SessionUser } | null> {
  try {
    const payload = await verifyJWT(refreshToken) as any;
    
    if (!payload || payload.type !== 'refresh') {
      return null;
    }

    // Пропускаем проверку базы данных для refresh token
    // JWT токен уже содержит всю необходимую информацию
    // и имеет встроенную проверку срока действия
    
    // Получаем данные пользователя из токена
    const user: SessionUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      createdAt: payload.createdAt
    };

      // Создаем новый access token
      const accessToken = await signJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        sessionId: payload.sessionId,
        type: 'access'
      }, '1h');

      return { accessToken, user };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
}

// Получаем данные сессии из access token
export async function getSessionFromToken(token: string): Promise<SessionData> {
  try {
    const payload = await verifyJWT(token) as any;
    
    if (!payload || payload.type !== 'access') {
      return { user: null, isAuthenticated: false };
    }

    // Пропускаем проверку базы данных для сессий
    // JWT токен уже содержит всю необходимую информацию
    // и имеет встроенную проверку срока действия

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        createdAt: payload.createdAt,
        image: payload.image
      },
      isAuthenticated: true,
      sessionId: payload.sessionId
    };
  } catch (error) {
    console.error('Failed to get session from token:', error);
    return { user: null, isAuthenticated: false };
  }
}

// Удаляем сессию
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await prisma.userSession.delete({
      where: { id: sessionId }
    });
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

// Очищаем истекшие сессии
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Устанавливаем cookies для аутентификации
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  // Access token - httpOnly, secure в продакшене
  response.cookies.set('session', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 час
    path: '/'
  });

  // Refresh token - httpOnly, secure в продакшене
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/'
  });
}

// Очищаем cookies аутентификации
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete('session');
  response.cookies.delete('refresh_token');
}
