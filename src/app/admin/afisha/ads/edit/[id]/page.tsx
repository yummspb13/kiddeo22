// src/app/admin/afisha/ads/edit/[id]/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'

export const dynamic = 'force-dynamic'

async function updateAdPlacement(formData: FormData) {
  'use server'
  
  // Проверяем авторизацию через ключ в formData
  const adminKey = formData.get('adminKey')?.toString()
  if (adminKey !== 'kidsreview2025') {
    throw new Error('Unauthorized')
  }
  
  const id = formData.get('id')?.toString()
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
    where: { id: Number(id) },
    data
  })
}

export default async function EditAdPlacementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  const adId = parseInt(id)
  if (isNaN(adId)) {
    notFound()
  }

  // Получаем рекламный слот
  const adPlacement = await prisma.adPlacement.findUnique({
    where: { id: adId },
    include: { City: true }
  })

  if (!adPlacement) {
    notFound()
  }

  // Получаем города
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <AdForm
      adPlacement={adPlacement}
      cities={cities}
      keySuffix={k}
      isEdit={true}
      onSubmit={updateAdPlacement}
    />
  )
}
