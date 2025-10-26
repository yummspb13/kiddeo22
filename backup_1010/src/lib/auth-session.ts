// Система управления сессиями с refresh tokens
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
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
    sessionId,
    type: 'access'
  }, '1h'); // 1 час

  // Создаем refresh token (долгоживущий)
  const refreshToken = await signJWT({
    sub: user.id,
    sessionId,
    type: 'refresh'
  }, '7d'); // 7 дней

  // Сохраняем сессию в базе данных
  try {
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO user_sessions (
        id, user_id, refresh_token, expires_at, created_at, updated_at
      ) VALUES (
        ${sessionId}, ${parseInt(user.id)}, ${refreshToken}, 
        datetime('now', '+7 days'), 
        datetime('now'), 
        datetime('now')
      )
    `;
  } catch (error) {
    console.error('Failed to save session to database:', error);
    // Продолжаем работу даже если не удалось сохранить в БД
  }

  return { accessToken, refreshToken };
}

// Обновляем access token используя refresh token
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; user: SessionUser } | null> {
  try {
    const payload = await verifyJWT(refreshToken) as any;
    
    if (!payload || payload.type !== 'refresh') {
      return null;
    }

    // Проверяем, что refresh token существует в базе данных
    try {
      const session = await prisma.$queryRaw`
        SELECT s.*, u.email, u.name, u.role 
        FROM user_sessions s
        JOIN User u ON s.user_id = u.id
        WHERE s.id = ${payload.sessionId} 
          AND s.refresh_token = ${refreshToken}
          AND s.expires_at > datetime('now')
      ` as any[];

      if (!session || session.length === 0) {
        return null;
      }

      const sessionData = session[0];
      const user: SessionUser = {
        id: sessionData.user_id.toString(),
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role
      };

      // Создаем новый access token
      const accessToken = await signJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sessionId: payload.sessionId,
        type: 'access'
      }, '1h');

      return { accessToken, user };
    } catch (dbError) {
      console.error('Failed to check refresh token in database:', dbError);
      // Если не можем проверить в БД, возвращаем null для безопасности
      return null;
    }
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

    // Проверяем, что сессия все еще активна в базе данных
    try {
      const session = await prisma.$queryRaw`
        SELECT * FROM user_sessions 
        WHERE id = ${payload.sessionId} 
          AND expires_at > datetime('now')
      ` as any[];

      if (!session || session.length === 0) {
        return { user: null, isAuthenticated: false };
      }
    } catch (dbError) {
      console.error('Failed to check session in database:', dbError);
      // Если не можем проверить в БД, все равно возвращаем данные из токена
      // Это обеспечивает работу даже при проблемах с БД
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
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
    await prisma.$executeRaw`
      DELETE FROM user_sessions WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

// Очищаем истекшие сессии
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM user_sessions WHERE expires_at <= datetime('now')
    `;
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
