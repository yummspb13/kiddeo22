import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    const venue = await prisma.venuePartner.findUnique({ where: { id: venueId }, select: { id: true, subcategoryId: true } })
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const parameterId = await ensureNewsParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }
    // Сортируем по дате
    items.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0))
    return NextResponse.json({ news: items })
  } catch (e) {
    console.error('NEWS GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


