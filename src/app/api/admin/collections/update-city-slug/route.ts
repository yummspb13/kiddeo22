import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { from, to } = await request.json()

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to are required' }, { status: 400 })
    }

    const result = await prisma.collection.updateMany({
      where: { citySlug: from },
      data: { citySlug: to }
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `Updated ${result.count} collections from citySlug '${from}' to '${to}'`
    })
  } catch (error) {
    console.error('Error updating collection citySlug:', error)
    return NextResponse.json({ error: 'Failed to update collection citySlug' }, { status: 500 })
  }
}
