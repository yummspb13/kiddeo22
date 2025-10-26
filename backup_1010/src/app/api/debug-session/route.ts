import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 DEBUG: Cookies:', request.cookies.getAll())
    
    const session = await getServerSession(request)
    console.log('🔍 DEBUG: Session from getServerSession:', {
      hasSession: !!session,
      userId: (session?.user as any)?.id,
      uid: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })
    
    return NextResponse.json({
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
      session: session ? {
        hasSession: true,
        userId: (session.user as any)?.id,
        uid: session.user?.uid,
        userEmail: session.user?.email,
        userRole: session.user?.role,
        userName: session.user?.name
      } : null
    })
  } catch (error) {
    console.error('❌ DEBUG: Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}