import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

async function ensureNewsParameter(subcategoryId: number) {
  let param = await prisma.venueParameter.findFirst({
    where: { subcategoryId, name: 'NEWS_JSON', isActive: true },
    select: { id: true }
  })
  if (!param) {
    param = await prisma.venueParameter.create({
      data: {
        subcategoryId,
        name: 'NEWS_JSON',
        type: 'TEXTAREA',
        config: { format: 'json', description: 'Venue news posts (title, text, imageUrl, createdAt)' },
        isFree: false,
        isOptimal: true,
        isMaximum: true,
        order: 10001,
        isActive: true,
      }, select: { id: true }
    })
  }
  return param.id
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const venueId = parseInt(id)
    if (Number.isNaN(venueId)) return NextResponse.json({ error: 'Invalid venue id' }, { status: 400 })

    const venue = await prisma.venuePartner.findUnique({ where: { id: venueId }, select: { id: true } })
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    // Получаем новости места через параметры
    const newsParameter = await prisma.venueParameter.findFirst({
      where: { 
        name: 'NEWS_JSON',
        isActive: true
      },
      select: { id: true }
    });

    if (!newsParameter) {
      return NextResponse.json({ news: [] });
    }

    const venueParameter = await prisma.venuePartnerParameter.findFirst({
      where: {
        partnerId: venueId,
        parameterId: newsParameter.id
      },
      select: { value: true }
    });

    let news = [];
    if (venueParameter?.value) {
      try {
        news = JSON.parse(venueParameter.value);
      } catch (e) {
        console.error('Error parsing news JSON:', e);
      }
    }

    return NextResponse.json({ news });
  } catch (e) {
    console.error('NEWS GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}