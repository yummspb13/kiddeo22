import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { CreditCard, Calendar, Clock, AlertTriangle } from 'lucide-react'
import VenueTariffsClient from './VenueTariffsClient'

export const dynamic = 'force-dynamic'

export default async function VenueTariffsPage({
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
          <h1 className="text-2xl font-bold text-gray-900">Тарифы мест</h1>
          <p className="text-sm text-gray-600">Управление тарифами и подписками для мест</p>
        </div>
      </div>

      {/* Статистика тарифов */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Бесплатные</p>
              <p className="text-2xl font-bold text-gray-900" id="free-count">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Супер</p>
              <p className="text-2xl font-bold text-blue-900" id="optimal-count">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Истекают</p>
              <p className="text-2xl font-bold text-orange-900" id="expiring-count">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Grace Period</p>
              <p className="text-2xl font-bold text-red-900" id="grace-count">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица мест с тарифами */}
      <VenueTariffsClient />
    </div>
  )
}
