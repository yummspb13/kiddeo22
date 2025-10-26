// src/app/admin/afisha/ads/create/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'

export const dynamic = 'force-dynamic'

async function createAdPlacement(formData: FormData) {
  'use server'
  
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

  await prisma.adPlacement.create({ data })
}

export default async function CreateAdPlacementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Получаем города
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <AdForm
      cities={cities}
      keySuffix={k}
      isEdit={false}
    />
  )
}
