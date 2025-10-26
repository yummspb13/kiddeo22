import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'

async function getOwnedVenue(userId: number, idParam: string) {
  const id = parseInt(idParam)
  if (Number.isNaN(id)) return null
  return prisma.venuePartner.findFirst({ where: { id, vendor: { userId } }, select: { id: true, subcategoryId: true } })
}

async function ensureNewsParameter(subcategoryId: number) {
  let param = await prisma.venueParameter.findFirst({ where: { subcategoryId, name: 'NEWS_JSON', isActive: true }, select: { id: true } })
  if (!param) {
    param = await prisma.venueParameter.create({
      data: {
        subcategoryId,
        name: 'NEWS_JSON',
        type: 'TEXTAREA',
        config: { format: 'json' },
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
    const session = await getServerSession(request)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    const parameterId = await ensureNewsParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }
    items.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0))
    return NextResponse.json({ news: items })
  } catch (e) {
    console.error('Vendor NEWS GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const body = await request.json()
    const title: string = (body?.title || '').toString().trim()
    const text: string = (body?.text || '').toString().trim()
    const imageUrl: string | undefined = body?.imageUrl ? String(body.imageUrl) : undefined
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const parameterId = await ensureNewsParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }

    // Лимит 3 в месяц
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const countThisMonth = items.filter(n => {
      const d = new Date(n.createdAt)
      return d.getFullYear() === y && d.getMonth() === m
    }).length
    if (countThisMonth >= 3) return NextResponse.json({ error: 'Лимит 3 новости в месяц' }, { status: 400 })

    const newItem = {
      id: Math.random().toString(36).slice(2, 10),
      title: title.slice(0, 120),
      text: text.slice(0, 2000),
      imageUrl: imageUrl?.slice(0, 512),
      createdAt: now.toISOString()
    }
    items.unshift(newItem)

    await prisma.venuePartnerParameter.upsert({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      update: { value: JSON.stringify(items) },
      create: { partnerId: venue.id, parameterId, value: JSON.stringify(items) }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Vendor NEWS POST error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const url = new URL(request.url)
    const newsId = url.searchParams.get('newsId') || ''
    if (!newsId) return NextResponse.json({ error: 'newsId required' }, { status: 400 })

    const parameterId = await ensureNewsParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }

    const next = items.filter(n => n.id !== newsId)
    await prisma.venuePartnerParameter.upsert({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      update: { value: JSON.stringify(next) },
      create: { partnerId: venue.id, parameterId, value: JSON.stringify(next) }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Vendor NEWS DELETE error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


