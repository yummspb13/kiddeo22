import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { redirect } from 'next/navigation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adId = parseInt(id)
    
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad ID' }, { status: 400 })
    }

    // Проверяем права доступа
    const url = new URL(request.url)
    const key = url.searchParams.get("key")
    if (key !== "kidsreview2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    
    const title = formData.get('title')?.toString() || ''
    const position = formData.get('position')?.toString() || ''
    const imageUrl = formData.get('imageUrl')?.toString() || ''
    const hrefUrl = formData.get('hrefUrl')?.toString() || ''
    const cityId = formData.get('cityId')?.toString()
    const startsAt = formData.get('startsAt')?.toString()
    const endsAt = formData.get('endsAt')?.toString()
    const weight = Number(formData.get('weight')?.toString() || '1')
    const order = Number(formData.get('order')?.toString() || '0')
    const isActive = formData.get('isActive') === 'on'

    const data = {
      page: 'afisha',
      position,
      title,
      imageUrl: imageUrl || null,
      hrefUrl: hrefUrl || null,
      cityId: cityId ? Number(cityId) : null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      weight,
      order,
      isActive
    }

    await prisma.adPlacement.update({
      where: { id: adId },
      data
    })

    return NextResponse.redirect(new URL(`/admin/afisha/ads?key=kidsreview2025`, request.url))
    
  } catch (error) {
    console.error('Error updating ad placement:', error)
    return NextResponse.json({ error: 'Failed to update ad placement' }, { status: 500 })
  }
}
