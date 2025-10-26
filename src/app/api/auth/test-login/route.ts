import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Создаем JWT токен для пользователя
    const jwt = require('jsonwebtoken')
    const accessToken = jwt.sign(
      { 
        sub: '2', // userId
        email: 'admin@kiddeo.ru',
        name: 'yummspb',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
        image: '/uploads/avatars/bb4b2aa5-3e45-4052-a0ca-cb0c4c96a52d.png',
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'access'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Устанавливаем cookie с сессией
    const response = NextResponse.redirect(new URL('/profile', request.url))
    response.cookies.set('session', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error setting test session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
