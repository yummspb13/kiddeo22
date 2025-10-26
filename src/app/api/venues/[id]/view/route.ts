import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return '127.0.0.1' // fallback для localhost
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`[API] Getting view count for venue ${id}`)
    
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

    // Проверяем, существует ли venue
    const venue = await prisma.venuePartner.findUnique({
      where: { id: parseInt(id) },
      select: { 
        id: true
      }
    })
    
    console.log(`[API] Venue found:`, venue)
    
    if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Возвращаем базовые значения, так как viewCount не существует в VenuePartner
    const viewCount: number = 0
    const uniqueViewCount: number = 0
    
    console.log(`[API] View count: ${viewCount}, unique views: ${uniqueViewCount}`)
    
    return NextResponse.json({ 
      viewCount: viewCount,
      uniqueViewCount 
    })
  } catch (e) {
    console.error('Error getting view count:', e)
    return NextResponse.json({ error: 'Failed', details: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

    // Проверяем, существует ли venue
    const venue = await prisma.venuePartner.findUnique({
      where: { id: parseInt(id) },
      select: { 
        id: true
      }
    })
    
    if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Возвращаем базовые значения, так как viewCount не существует в VenuePartner
    const viewCount = 0
    const uniqueViewCount = 0
    
    return new NextResponse(JSON.stringify({ 
      viewCount,
      uniqueViewCount,
      alreadyViewed: false
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    console.error('Error incrementing view count:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
