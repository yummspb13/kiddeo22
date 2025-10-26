import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function ensureQaParameter(subcategoryId: number) {
  let param = await prisma.venueParameter.findFirst({
    where: { subcategoryId, name: 'QA_JSON', isActive: true },
    select: { id: true }
  })
  if (!param) {
    param = await prisma.venueParameter.create({
      data: {
        subcategoryId,
        name: 'QA_JSON',
        type: 'TEXTAREA',
        config: { format: 'json', description: 'Q&A items for venue' },
        isFree: false,
        isOptimal: true,
        isMaximum: true,
        order: 10000,
        isActive: true,
      },
      select: { id: true }
    })
  }
  return param.id
}

function generateId() { return Math.random().toString(36).slice(2, 10) }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const venueId = parseInt(id)
    if (Number.isNaN(venueId)) return NextResponse.json({ error: 'Invalid venue id' }, { status: 400 })

    const venue = await prisma.venuePartner.findUnique({ where: { id: venueId }, select: { id: true, subcategoryId: true } })
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const parameterId = await ensureQaParameter(venue.subcategoryId)
    const value = await prisma.venuePartnerParameter.findUnique({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      select: { value: true }
    })
    let items: Array<any> = []
    if (value?.value) { try { const parsed = JSON.parse(value.value); if (Array.isArray(parsed)) items = parsed } catch {} }
    const publicItems = items.filter((x) => x && (x.answer || x.status === 'APPROVED'))
    return NextResponse.json({ qa: publicItems })
  } catch (e) {
    console.error('QA GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const venueId = parseInt(id)
    if (Number.isNaN(venueId)) return NextResponse.json({ error: 'Invalid venue id' }, { status: 400 })

    const body = await request.json()
    const text: string = (body?.text || '').toString()
    const author: string = (body?.author || 'Аноним').toString()
    if (!text.trim()) return NextResponse.json({ error: 'Question text is required' }, { status: 400 })

    const venue = await prisma.venuePartner.findUnique({ where: { id: venueId }, select: { id: true, subcategoryId: true } })
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const parameterId = await ensureQaParameter(venue.subcategoryId)
    const existing = await prisma.venuePartnerParameter.findUnique({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      select: { value: true }
    })
    let items: Array<any> = []
    if (existing?.value) { try { const parsed = JSON.parse(existing.value); if (Array.isArray(parsed)) items = parsed } catch {} }

    const newItem = { id: generateId(), text: text.trim().slice(0, 500), author: author.trim().slice(0, 64), createdAt: new Date().toISOString(), status: 'MODERATION' }
    items.unshift(newItem)

    await prisma.venuePartnerParameter.upsert({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      update: { value: JSON.stringify(items) },
      create: { partnerId: venue.id, parameterId, value: JSON.stringify(items) }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('QA POST error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


