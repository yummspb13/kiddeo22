import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Оптимизированная версия — используем прямую верификацию JWT вместо getServerSession
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const token = request.cookies.get('session')?.value
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        user: null,
        message: 'Not authenticated'
      })
    }

    // Быстрая верификация JWT с таймаутом 1 секунда
    const payload = await Promise.race([
      verifyJWT(token),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
    ]) as any
    
    if (!payload) {
      return NextResponse.json({ 
        success: false,
        user: null,
        message: 'Invalid session'
      })
    }

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`⚠️ Slow /api/simple-user: ${duration}ms`)
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        image: null // JWT не хранит image, если нужно — добавьте в payload при создании токена
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ /api/simple-user error after ${duration}ms:`, error)
    return NextResponse.json({ 
      success: false,
      user: null,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
