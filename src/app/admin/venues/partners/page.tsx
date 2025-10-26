// src/app/admin/venues/partners/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import VenuePartnersClient from './VenuePartnersClient'

export const dynamic = 'force-dynamic'

export default async function VenuePartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return <VenuePartnersClient />
}

