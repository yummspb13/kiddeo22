import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET: получить опубликованные новости места (публичный доступ)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id);
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    // Получаем только опубликованные новости места
    const news = await prisma.venueNews.findMany({
      where: { 
        venueId,
        isPublished: true
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json({ news });

  } catch (error) {
    console.error('GET /api/public/venues/[id]/news error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
