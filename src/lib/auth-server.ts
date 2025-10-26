import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';
import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Session {
  user: User;
}

// Замена для getServerSession
export async function getServerSession(request?: NextRequest): Promise<Session | null> {
  try {
    let token: string | undefined;
    
    if (request) {
      // Если передан request, используем его cookies
      token = request.cookies.get('session')?.value;
      console.log('🔍 AUTH-SERVER: Using request cookies, token:', !!token);
    } else {
      // Если request не передан, используем cookies() напрямую
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('session')?.value;
        console.log('🔍 AUTH-SERVER: Using headers cookies, token:', !!token, 'cookie value:', token?.substring(0, 20) + '...');
      } catch (cookieError) {
        console.log('🔍 AUTH-SERVER: Error getting cookies:', cookieError);
        return null;
      }
    }
    
    if (!token) {
      console.log('🔍 AUTH-SERVER: No token found');
      return null;
    }

    console.log('🔍 AUTH-SERVER: Verifying JWT token...');

    // Безопасная верификация токена с таймаутом, чтобы не блокировать SSR
    const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T | null> => {
      return await Promise.race<Promise<T | null>>([
        promise as unknown as Promise<T | null>,
        new Promise<T | null>((resolve) => setTimeout(() => resolve(null), ms)),
      ]);
    };

    const payload = await withTimeout(verifyJWT(token), 3000);
    
    if (!payload) {
      console.log('🔍 AUTH-SERVER: JWT verification failed');
      return null;
    }

    console.log('🔍 AUTH-SERVER: JWT verified successfully, user:', payload.sub);
    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    };
  } catch (error) {
    console.error('🔍 AUTH-SERVER: getServerSession error:', error);
    return null;
  }
}

// Замена для getToken
export async function getToken(request?: NextRequest): Promise<any> {
  try {
    const token = request?.cookies.get('session')?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyJWT(token);
    
    if (!payload) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    console.error('getToken error:', error);
    return null;
  }
}
