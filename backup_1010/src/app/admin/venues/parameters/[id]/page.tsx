import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import VenueParameterEditClient from './VenueParameterEditClient'

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
  console.log('Page params:', { id, searchParams: sp })
  
  try {
    await requireAdminOrDevKey(sp)
    console.log('Authorization successful')
  } catch (error) {
    console.error('Authorization failed:', error)
    throw error
  }
  
  const k = await keySuffix(sp)
  console.log('Key suffix:', k)

  return <VenueParameterEditClient subcategoryId={parseInt(id)} k={k} />
}

