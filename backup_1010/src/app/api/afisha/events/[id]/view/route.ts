import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Функция для получения IP адреса
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return '127.0.0.1' // fallback для localhost
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

    const event = await prisma.afishaEvent.findUnique({
      where: { id: id },
      select: { 
        viewCount: true,
        eventViews: {
          select: { id: true }
        }
      }
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Возвращаем общее количество просмотров и количество уникальных просмотров
    const viewCount: number = event.viewCount ?? 0
    const uniqueViewCount: number = event.eventViews.length
    
    return new NextResponse(JSON.stringify({ 
      viewCount: viewCount ?? 0,
      uniqueViewCount 
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Проверяем, есть ли уже просмотр с этого IP
    const existingView = await prisma.eventView.findFirst({
      where: {
        eventId: id,
        ipAddress: ipAddress
      }
    })

    if (existingView) {
      // Если просмотр уже есть, возвращаем текущий счетчик
      const event = await prisma.afishaEvent.findUnique({
        where: { id: id },
        select: { 
          viewCount: true,
          eventViews: {
            select: { id: true }
          }
        }
      })
      
      if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      const viewCount = event.viewCount ?? 0
      const uniqueViewCount = event.eventViews.length
      
      return new NextResponse(JSON.stringify({ 
        viewCount,
        uniqueViewCount,
        alreadyViewed: true
      }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      })
    }

    // Если просмотра нет, создаем новый уникальный просмотр
    await prisma.$transaction(async (tx) => {
      // Создаем запись о просмотре
      await tx.eventView.create({
        data: {
          eventId: id,
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      })

      // Увеличиваем общий счетчик просмотров
      await tx.afishaEvent.update({
        where: { id: id },
        data: { viewCount: { increment: 1 } }
      })
    })

    // Получаем обновленные данные
    const event = await prisma.afishaEvent.findUnique({
      where: { id: id },
      select: { 
        viewCount: true,
        eventViews: {
          select: { id: true }
        }
      }
    })
    
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const viewCount = event.viewCount ?? 0
    const uniqueViewCount = event.eventViews.length
    
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


