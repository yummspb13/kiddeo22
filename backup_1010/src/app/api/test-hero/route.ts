import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Test hero API called')
  
  return NextResponse.json({
    message: 'Test hero API works',
    timestamp: new Date().toISOString()
  })
}
