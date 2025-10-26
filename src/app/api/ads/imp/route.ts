import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { adId, cityId } = await req.json().catch(() => ({}))
    if (!adId) return NextResponse.json({ ok: false, error: 'no adId' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''
    const ua = req.headers.get('user-agent') ?? ''

    await prisma.adEvent.create({
      data: {
        adPlacementId: Number(adId),
        type: 'IMPRESSION',
        ip: ip.slice(0, 255),
        ua: ua.slice(0, 255),
        cityId: cityId ? Number(cityId) : null,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
