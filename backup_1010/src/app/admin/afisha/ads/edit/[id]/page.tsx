// src/app/admin/afisha/ads/edit/[id]/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'

export const dynamic = 'force-dynamic'

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
    />
  )
}
