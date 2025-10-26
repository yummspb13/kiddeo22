import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'
export const runtime = 'nodejs'

async function getOwnedVenue(userId: number, idParam: string) {
  const id = parseInt(idParam)
  if (Number.isNaN(id)) return null
  return prisma.venuePartner.findFirst({ where: { id, vendor: { userId } }, select: { id: true, subcategoryId: true } })
}

async function ensureQaParameter(subcategoryId: number) {
  let param = await prisma.venueParameter.findFirst({ where: { subcategoryId, name: 'QA_JSON', isActive: true }, select: { id: true } })
  if (!param) {
    param = await prisma.venueParameter.create({
      data: {
        subcategoryId,
        name: 'QA_JSON',
        type: 'TEXTAREA',
        config: { format: 'json' },
        isFree: false,
        isOptimal: true,
        isMaximum: true,
        order: 10000,
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
    const parameterId = await ensureQaParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }
    return NextResponse.json({ qa: items })
  } catch (e) {
    console.error('Vendor QA GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: approve/reject/answer
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    const body = await request.json()
    const itemId: string = body?.id
    const action: 'APPROVE' | 'REJECT' | 'ANSWER' = body?.action
    const answer: string | undefined = body?.answer
    if (!itemId || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })

    const parameterId = await ensureQaParameter(venue.subcategoryId)
    const v = await prisma.venuePartnerParameter.findUnique({ where: { partnerId_parameterId: { partnerId: venue.id, parameterId } }, select: { value: true } })
    let items: Array<any> = []
    if (v?.value) { try { const parsed = JSON.parse(v.value); if (Array.isArray(parsed)) items = parsed } catch {} }

    const idx = items.findIndex(x => x?.id === itemId)
    if (idx === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    if (action === 'APPROVE') items[idx].status = 'APPROVED'
    if (action === 'REJECT') items[idx].status = 'REJECTED'
    if (action === 'ANSWER') items[idx].answer = (answer || '').toString().trim().slice(0, 1000)

    await prisma.venuePartnerParameter.upsert({
      where: { partnerId_parameterId: { partnerId: venue.id, parameterId } },
      update: { value: JSON.stringify(items) },
      create: { partnerId: venue.id, parameterId, value: JSON.stringify(items) }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Vendor QA PATCH error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


