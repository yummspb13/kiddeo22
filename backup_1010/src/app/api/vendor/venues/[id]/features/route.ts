import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'

// Helper to ensure vendor owns venue
async function getOwnedVenue(vendorUserId: number, venueIdParam: string) {
  const venueId = parseInt(venueIdParam)
  if (Number.isNaN(venueId)) return null
  const venue = await prisma.venuePartner.findFirst({
    where: { id: venueId, vendor: { userId: vendorUserId } },
    select: { id: true, subcategoryId: true }
  })
  return venue
}

// Ensure there is a parameter to store features JSON for this subcategory
async function ensureFeaturesParameter(subcategoryId: number) {
  let param = await prisma.venueParameter.findFirst({
    where: {
      subcategoryId,
      name: 'FEATURES_JSON',
      isActive: true,
    },
    select: { id: true }
  })
  if (!param) {
    param = await prisma.venueParameter.create({
      data: {
        subcategoryId,
        name: 'FEATURES_JSON',
        type: 'TEXTAREA',
        config: { format: 'json', description: 'Features list stored as JSON array of { icon, text }' },
        isFree: false,
        isOptimal: true,
        isMaximum: true,
        order: 9999,
        isActive: true,
      },
      select: { id: true }
    })
  }
  return param.id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const parameterId = await ensureFeaturesParameter(venue.subcategoryId)

    const existing = await prisma.venuePartnerParameter.findUnique({
      where: {
        partnerId_parameterId: {
          partnerId: venue.id,
          parameterId
        }
      },
      select: { value: true }
    })

    let items: Array<{ icon?: string; text: string }> = []
    if (existing?.value) {
      try {
        const parsed = JSON.parse(existing.value)
        if (Array.isArray(parsed)) items = parsed
      } catch {}
    }

    return NextResponse.json({ features: items })
  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venue = await getOwnedVenue(parseInt(session.user.id), id)
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const body = await request.json()
    const items = Array.isArray(body?.features) ? body.features : []

    // Basic validation
    const cleaned = items
      .filter((x: any) => x && typeof x.text === 'string' && x.text.trim().length > 0)
      .slice(0, 20)
      .map((x: any) => ({ icon: typeof x.icon === 'string' ? x.icon.slice(0, 64) : undefined, text: x.text.trim().slice(0, 200) }))

    const parameterId = await ensureFeaturesParameter(venue.subcategoryId)

    await prisma.venuePartnerParameter.upsert({
      where: {
        partnerId_parameterId: {
          partnerId: venue.id,
          parameterId
        }
      },
      update: { value: JSON.stringify(cleaned) },
      create: {
        partnerId: venue.id,
        parameterId,
        value: JSON.stringify(cleaned)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


