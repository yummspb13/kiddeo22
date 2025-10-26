import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import VenueParameterEditForm from './VenueParameterEditForm'

export const dynamic = 'force-dynamic'

export default async function VenueParameterEditPage({
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

  return <VenueParameterEditForm parameterId={parseInt(id)} k={k} />
}
