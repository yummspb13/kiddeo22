// src/app/admin/afisha/filters/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { getQuickFilters, getAdPlacements } from '@/lib/afisha-admin'
import prisma from '@/lib/db'
import AfishaFiltersClient from './AfishaFiltersClient'

export const dynamic = 'force-dynamic'

export default async function AfishaFiltersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  const [quickFilters, adPlacements, cities] = await Promise.all([
    getQuickFilters(),
    getAdPlacements(),
    prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  // Transform data to match expected types
  const transformedQuickFilters = quickFilters.map(filter => ({
    ...filter,
    city: filter.City ? { name: filter.City.name } : undefined
  }))

  const transformedAdPlacements = adPlacements.map(placement => ({
    ...placement,
    city: placement.City ? { name: placement.City.name } : undefined,
    imageUrl: placement.imageUrl || undefined,
    hrefUrl: placement.hrefUrl || undefined,
    startsAt: placement.startsAt || undefined,
    endsAt: placement.endsAt || undefined
  }))

  return (
    <AfishaFiltersClient 
      quickFilters={transformedQuickFilters}
      adPlacements={transformedAdPlacements as any}
      cities={cities}
      keySuffix={k}
    />
  )
}