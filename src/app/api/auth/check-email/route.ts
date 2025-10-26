import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        exists: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Проверяем, существует ли пользователь с таким email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    return NextResponse.json({ 
      exists: !!user
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ 
      exists: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}