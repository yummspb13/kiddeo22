import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const { adId } = await params
    
    if (!adId || isNaN(parseInt(adId))) {
      return NextResponse.json(
        { error: 'Valid ad ID is required' },
        { status: 400 }
      )
    }

    // Увеличиваем счетчик кликов
    const updatedAd = await prisma.homePageAd.update({
      where: { id: parseInt(adId) },
      data: {
        clicks: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      clicks: updatedAd.clicks 
    })
  } catch (error) {
    console.error('Error tracking ad click:', error)
    return NextResponse.json(
      { error: 'Failed to track ad click' },
      { status: 500 }
    )
  }
}