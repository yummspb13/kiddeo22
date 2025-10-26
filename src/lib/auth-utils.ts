import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';

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
    // Если request не передан, пытаемся получить cookies из headers
    let token;
    if (request) {
      token = request.cookies.get('session')?.value;
    } else {
      // Для серверных компонентов используем cookies() из next/headers
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        token = cookieStore.get('session')?.value;
      } catch (error) {
        console.log('🔍 AUTH-UTILS: Could not get cookies from headers:', error);
        return null;
      }
    }
    
    if (!token) {
      console.log('🔍 AUTH-UTILS: No session token found');
      return null;
    }

    console.log('🔍 AUTH-UTILS: Verifying JWT token...');
    const payload = await verifyJWT(token);
    
    if (!payload) {
      console.log('🔍 AUTH-UTILS: JWT verification failed');
      return null;
    }

    console.log('🔍 AUTH-UTILS: JWT verified successfully, user:', payload.sub);
    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    };
  } catch (error) {
    console.error('🔍 AUTH-UTILS: getServerSession error:', error);
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
    return payload;
  } catch (error) {
    console.error('getToken error:', error);
    return null;
  }
}
