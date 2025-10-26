// src/app/admin/venues/parameters/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { VenueParametersClient } from './VenueParametersClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VenueParametersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Параметры подкатегорий</h1>
          <p className="text-sm text-gray-600">Настройка параметров для заполнения партнерами информации о местах</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href={`/admin/venues?key=${k}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в Места
          </Link>
        </div>
      </div>

      <VenueParametersClient />
    </div>
  )
}

