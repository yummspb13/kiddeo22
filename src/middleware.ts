// src/middleware.ts - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Расширяем middleware для обработки событий
export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/profile/:path*',
    '/:city/events',
    '/:city/event/:slug*',
    '/city/:slug/cat/events',
    '/((?!api|_next/static|_next/image|favicon.ico).*)' // Исключаем API routes
  ]
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  
  console.log(`🔍 MIDDLEWARE: ${req.method} ${pathname} - Started at ${new Date().toISOString()}`)
  
  // Исключаем API routes
  if (pathname.startsWith('/api/')) {
    console.log(`🔍 MIDDLEWARE: Skipping API route: ${pathname}`)
    return NextResponse.next()
  }
  
  // Обработка переадресаций для старых slug'ов городов
  if (pathname.startsWith('/city/moskva/')) {
    // Redirect: /city/moskva/... → /city/moscow/... (301 редирект)
    const newPath = pathname.replace('/city/moskva/', '/city/moscow/')
    console.log(`🔄 MIDDLEWARE: Redirecting old city slug: ${pathname} → ${newPath}`)
    return NextResponse.redirect(new URL(newPath, req.url), 301)
  }
  
  if (pathname.startsWith('/moskva/')) {
    // Redirect: /moskva/... → /moscow/... (301 редирект)
    const newPath = pathname.replace('/moskva/', '/moscow/')
    console.log(`🔄 MIDDLEWARE: Redirecting old city slug: ${pathname} → ${newPath}`)
    return NextResponse.redirect(new URL(newPath, req.url), 301)
  }
  
  // Обработка событий - только redirect для старых URL
  // Новые URL /[city]/events уже обрабатываются Next.js напрямую
  
  if (pathname.match(/^\/city\/[^/]+\/cat\/events/)) {
    // Redirect: /city/moscow/cat/events → /moscow/events (301 редирект)
    const city = pathname.split('/')[2]
    console.log(`🔄 MIDDLEWARE: Redirecting /city/${city}/cat/events to /${city}/events`)
    return NextResponse.redirect(new URL(`/${city}/events`, req.url), 301)
  }
  
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
    
    // Проверяем валидность JWT токена (ленивая загрузка)
    try {
      const { verifyJWT } = await import('@/lib/jwt')
      const payload = await verifyJWT(sessionCookie.value)
      
      if (!payload) {
        console.log('🔍 MIDDLEWARE: Invalid JWT token, redirecting to login')
        const url = new URL('/', req.url)
        url.searchParams.set('login', 'true')
        return NextResponse.redirect(url)
      }
      
      console.log('🔍 MIDDLEWARE: Valid JWT token, allowing access')
    } catch (error) {
      console.log('🔍 MIDDLEWARE: JWT verification error, redirecting to login:', error)
      const url = new URL('/', req.url)
      url.searchParams.set('login', 'true')
      return NextResponse.redirect(url)
    }
    
    console.log('🔍 MIDDLEWARE: Session cookie found, allowing access')
  }

  return NextResponse.next()
}