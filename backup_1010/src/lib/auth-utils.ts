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
    const token = request?.cookies.get('session')?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyJWT(token);
    
    if (!payload) {
      return null;
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    };
  } catch (error) {
    console.error('getServerSession error:', error);
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
