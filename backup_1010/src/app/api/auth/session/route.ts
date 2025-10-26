import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken, refreshAccessToken, setAuthCookies, clearAuthCookies } from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('session')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    // Если нет access token, проверяем refresh token
    if (!accessToken && refreshToken) {
      const refreshResult = await refreshAccessToken(refreshToken);
      
      if (refreshResult) {
        const response = NextResponse.json({ 
          user: refreshResult.user,
          refreshed: true
        });
        
        // Устанавливаем новые cookies
        setAuthCookies(response, refreshResult.accessToken, refreshToken);
        return response;
      } else {
        // Refresh token недействителен, очищаем cookies
        const response = NextResponse.json({ user: null });
        clearAuthCookies(response);
        return response;
      }
    }
    
    // Если нет токенов вообще
    if (!accessToken) {
      return NextResponse.json({ user: null });
    }

    // Проверяем access token
    const sessionData = await getSessionFromToken(accessToken);
    
    if (!sessionData.isAuthenticated) {
      // Access token недействителен, пробуем refresh
      if (refreshToken) {
        const refreshResult = await refreshAccessToken(refreshToken);
        
        if (refreshResult) {
          const response = NextResponse.json({ 
            user: refreshResult.user,
            refreshed: true
          });
          
          // Устанавливаем новые cookies
          setAuthCookies(response, refreshResult.accessToken, refreshToken);
          return response;
        }
      }
      
      // Не удалось обновить, очищаем cookies
      const response = NextResponse.json({ user: null });
      clearAuthCookies(response);
      return response;
    }
    
    return NextResponse.json({ 
      user: sessionData.user,
      refreshed: false
    });
  } catch (error) {
    console.error('/api/auth/session error:', error);
    const response = NextResponse.json({ user: null }, { status: 500 });
    clearAuthCookies(response);
    return response;
  }
}
