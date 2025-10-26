import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const cityId = searchParams.get('cityId') ? Number(searchParams.get('cityId')) : undefined

    const where: any = {}
    if (cityId) where.cityId = cityId
    if (q) where.displayName = { contains: q }

    const vendors = await prisma.vendor.findMany({
      where,
      select: { id: true, displayName: true },
      orderBy: { displayName: 'asc' },
      take: 20,
    })
    return NextResponse.json({ vendors }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ vendors: [] }, { status: 200 })
  }
}


