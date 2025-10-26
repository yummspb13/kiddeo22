import { Suspense } from 'react'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import VenueReviewsClient from './VenueReviewsClient'

export const dynamic = 'force-dynamic'

export default async function VenueReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация отзывов мест</h1>
          <p className="text-sm text-gray-600">Управление отзывами о местах</p>
        </div>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <VenueReviewsClient searchParams={sp} />
      </Suspense>
    </div>
  )
}
