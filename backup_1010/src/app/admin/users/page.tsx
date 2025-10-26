// src/app/admin/users/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UsersClient />
      </div>
    </div>
  )
}
