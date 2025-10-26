import { Suspense } from 'react'
import Link from 'next/link'
import { Trash2, ArrowLeft } from 'lucide-react'
import VenueVendorsClient from './VenueVendorsClient'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'

export default async function VenueVendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Вендоры</h1>
          <p className="text-gray-600">Управление вендорами площадок</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href={`/admin/venues?key=${k}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в Места
          </Link>
        <Link href="/admin/venues/vendors/cleanup">
          <button className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 bg-white hover:bg-red-50 rounded-md text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4 mr-2" />
            Очистка вендоров
          </button>
        </Link>
        </div>
      </div>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <VenueVendorsClient />
      </Suspense>
    </div>
  )
}
