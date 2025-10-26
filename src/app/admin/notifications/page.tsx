// src/app/admin/notifications/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { useAdminNotifications } from '@/hooks/useAdminNotifications'
import NotificationDropdown from '@/components/admin/NotificationDropdown'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage({
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
          <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
          <p className="text-sm text-gray-600">Все уведомления системы</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Системные уведомления
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Новые пользователи */}
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Новые пользователи</h3>
                  <p className="text-sm text-gray-600">Зарегистрировались новые пользователи в системе</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  12
                </span>
                <a 
                  href={`/admin/users${k}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Перейти →
                </a>
              </div>
            </div>
          </div>

          {/* Новые вендоры */}
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Новые вендоры</h3>
                  <p className="text-sm text-gray-600">Зарегистрировались новые вендоры</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  8
                </span>
                <a 
                  href={`/admin/vendors${k}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Перейти →
                </a>
              </div>
            </div>
          </div>

          {/* Требуют одобрения */}
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Требуют одобрения</h3>
                  <p className="text-sm text-gray-600">Вендоры ждут активации аккаунтов</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                  3
                </span>
                <a 
                  href={`/admin/vendors${k}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Перейти →
                </a>
              </div>
            </div>
          </div>

          {/* Новые лиды */}
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Новые лиды</h3>
                  <p className="text-sm text-gray-600">Поступили новые заявки от клиентов</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                  25
                </span>
                <a 
                  href={`/admin/leads${k}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Перейти →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Всего уведомлений: <span className="font-medium">48</span>
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                Отметить все как прочитанные
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                Очистить все
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
