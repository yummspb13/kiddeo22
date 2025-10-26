// src/middleware.ts - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ API логирования
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ограничиваем middleware только защищенными зонами
export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/profile/:path*'
  ]
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  
  console.log(`🔍 MIDDLEWARE: ${req.method} ${pathname} - Started at ${new Date().toISOString()}`)
  
  // Простая проверка - если это защищенная зона, проверяем авторизацию
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendor') || pathname.startsWith('/profile')) {
    // Для админки проверяем ключ админа
    if (pathname.startsWith('/admin')) {
      const adminKey = searchParams.get('key')
      if (adminKey === 'kidsreview2025') {
        // Ключ админа корректный, пропускаем
        return NextResponse.next()
      }
    }
    
    // Проверяем наличие сессии в cookies для других защищенных зон
    const sessionCookie = req.cookies.get('session')
    console.log('🔍 MIDDLEWARE: Session cookie check:', { 
      hasCookie: !!sessionCookie, 
      cookieValue: sessionCookie?.value?.substring(0, 20) + '...' 
    })
    
    if (!sessionCookie) {
      console.log('🔍 MIDDLEWARE: No session cookie, redirecting to login')
      // Если нет сессии, перенаправляем на главную с модалкой логина
      const url = new URL('/', req.url)
      url.searchParams.set('login', 'true')
      return NextResponse.redirect(url)
    }
    
    console.log('🔍 MIDDLEWARE: Session cookie found, allowing access')
  }

  return NextResponse.next()
}