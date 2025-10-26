import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Получаем подборку по slug
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        eventCollections: {
          include: {
            event: true
          },
          orderBy: [
            { event: { startDate: 'asc' } },
            { event: { createdAt: 'desc' } }
          ]
        }
      }
    })
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    
    if (!collection.isActive) {
      return NextResponse.json({ error: 'Collection is not active' }, { status: 404 })
    }
    
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
