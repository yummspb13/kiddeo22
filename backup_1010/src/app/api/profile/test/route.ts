import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Простой тест без авторизации
    return NextResponse.json({ 
      message: 'API работает',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in test API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
