// src/app/admin/homepage/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Home, Settings, Image, Layout, Megaphone, MapPin } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomepagePage({
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
          <h1 className="text-2xl font-bold text-gray-900">Главная страница</h1>
          <p className="text-sm text-gray-600">Управление блоками и контентом главной страницы</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Управление блоками */}
        <Link 
          href={`/admin/homepage/blocks${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Layout className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Блоки страницы</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление блоками главной страницы, их порядком и видимостью
          </p>
          <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Реклама */}
        <Link 
          href={`/admin/homepage/ads${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Megaphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Реклама</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление рекламными блоками на главной странице
          </p>
          <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Города */}
        <Link 
          href={`/admin/cities${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Города</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление городами, их включением и отключением
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Настройки */}
        <Link 
          href={`/admin/homepage/settings${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Настройки</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Общие настройки главной страницы
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-600 group-hover:text-gray-700">
            <span>Перейти к настройкам</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Статистика */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика главной страницы</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Активных блоков</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Рекламных блоков</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Просмотров сегодня</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">4.8</div>
            <div className="text-sm text-gray-600">Средний рейтинг</div>
          </div>
        </div>
      </div>
    </div>
  )
}
