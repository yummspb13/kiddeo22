import { cookies, headers } from 'next/headers'
import { verifyJWT } from './jwt'

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Session {
  user: User;
}

export async function getSession(): Promise<Session | null> {
  try {
    console.log('🔍 SESSION-UTILS: Getting session...')
    
    // Пробуем получить cookies разными способами
    let sessionToken: string | undefined
    
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('session')
      sessionToken = sessionCookie?.value
      console.log('🔍 SESSION-UTILS: Cookie method - hasCookie:', !!sessionCookie, 'value:', sessionToken?.substring(0, 20) + '...')
    } catch (cookieError) {
      console.log('🔍 SESSION-UTILS: Cookie method failed:', cookieError)
    }
    
    // Если cookies не сработали, пробуем headers
    if (!sessionToken) {
      try {
        const headersList = await headers()
        const cookieHeader = headersList.get('cookie')
        console.log('🔍 SESSION-UTILS: Headers method - cookie header:', cookieHeader?.substring(0, 50) + '...')
        
        if (cookieHeader) {
          const sessionMatch = cookieHeader.match(/session=([^;]+)/)
          if (sessionMatch) {
            sessionToken = sessionMatch[1]
            console.log('🔍 SESSION-UTILS: Found session in headers:', sessionToken?.substring(0, 20) + '...')
          }
        }
      } catch (headerError) {
        console.log('🔍 SESSION-UTILS: Headers method failed:', headerError)
      }
    }
    
    if (!sessionToken) {
      console.log('🔍 SESSION-UTILS: No session token found')
      return null
    }

    console.log('🔍 SESSION-UTILS: Verifying JWT...')
    const payload = await verifyJWT(sessionToken)
    
    if (!payload) {
      console.log('🔍 SESSION-UTILS: JWT verification failed')
      return null
    }

    console.log('🔍 SESSION-UTILS: JWT verified successfully, user:', payload.sub)
    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    }
  } catch (error) {
    console.error('🔍 SESSION-UTILS: Error getting session:', error)
    return null
  }
}
