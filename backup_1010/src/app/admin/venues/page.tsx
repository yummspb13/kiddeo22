// src/app/admin/venues/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { MapPin, Filter, Megaphone, Settings, BarChart3, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import VenuesStatsClient from './VenuesStatsClient'

export const dynamic = 'force-dynamic'

export default async function VenuesPage({
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
          <h1 className="text-2xl font-bold text-gray-900">Места</h1>
          <p className="text-sm text-gray-600">Управление фильтрами мест и рекламой</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Категории */}
        <Link 
          href={`/admin/venues/categories${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Категории</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление категориями мест с иконками, цветами и привязкой к городам
          </p>
          <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Подкатегории */}
        <Link 
          href={`/admin/venues/subcategories${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Подкатегории</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление подкатегориями мест и услуг с привязкой к категориям
          </p>
          <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Параметры */}
        <Link 
          href={`/admin/venues/parameters${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-cyan-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <Settings className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Параметры</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Настройка параметров для заполнения партнерами информации о местах
          </p>
          <div className="mt-4 flex items-center text-sm text-cyan-600 group-hover:text-cyan-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Фильтры */}
        <Link 
          href={`/admin/venues/filters${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Фильтры</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление фильтрами для подкатегорий мест
          </p>
          <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Партнеры */}
        <Link 
          href={`/admin/venues/partners${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Партнеры</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление партнерами и их местами с модерацией
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Модерация отзывов */}
        <Link 
          href={`/admin/venues/reviews${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-yellow-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Модерация отзывов</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Одобрение и отклонение отзывов о местах с фотографиями
          </p>
          <div className="mt-4 flex items-center text-sm text-yellow-600 group-hover:text-yellow-700">
            <span>Перейти к модерации</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Вендоры */}
        <Link 
          href={`/admin/venues/vendors${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Вендоры</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление вендорами с проверкой документов и модерацией
          </p>
          <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Реклама */}
        <Link 
          href={`/admin/venues/ads${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Megaphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Реклама</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление рекламными блоками в разделе "Места"
          </p>
          <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Видимость */}
        <Link 
          href={`/admin/visibility${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Видимость</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Настройка видимости разделов по городам, категориям и подкатегориям
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Аналитика */}
        <Link 
          href={`/admin/venues/analytics${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Аналитика</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Статистика использования фильтров и популярности мест
          </p>
          <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
            <span>Перейти к аналитике</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Статистика */}
      <VenuesStatsClient />
    </div>
  )
}
