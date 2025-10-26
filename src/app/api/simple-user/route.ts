import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export const dynamic = 'force-dynamic'
export const revalidate = 30 // Кэш на 30 секунд

// Оптимизированная версия — используем прямую верификацию JWT вместо getServerSession
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const token = request.cookies.get('session')?.value
    console.log('🔍 SIMPLE-USER: Token check:', {
      hasToken: !!token,
      tokenLength: token?.length
    })
    
    if (!token) {
      console.log('❌ SIMPLE-USER: No token found')
      return NextResponse.json({ 
        success: false,
        user: null,
        message: 'Not authenticated'
      })
    }

    // Быстрая верификация JWT с таймаутом 1 секунда
    console.log('🔍 SIMPLE-USER: Verifying JWT token')
    const payload = await Promise.race([
      verifyJWT(token),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
    ]) as any
    
    console.log('🔍 SIMPLE-USER: JWT verification result:', {
      hasPayload: !!payload,
      payload: payload ? { sub: payload.sub, name: payload.name, email: payload.email } : null
    })
    
    if (!payload) {
      console.log('❌ SIMPLE-USER: Invalid JWT token')
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

    const userData = {
      id: parseInt(payload.sub), // Преобразуем в число для совместимости с базой данных
      name: payload.name,
      email: payload.email,
      image: null // JWT не хранит image, если нужно — добавьте в payload при создании токена
    }
    
    console.log('✅ SIMPLE-USER: Returning user data:', userData)
    
    const response = NextResponse.json({ 
      success: true,
      user: userData
    })
    
    // Добавляем заголовки кэширования
    response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    
    return response
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
