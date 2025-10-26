// src/app/admin/afisha/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Calendar, Filter, Megaphone, DollarSign, BarChart3, Settings, Plus, Eye, Users, TrendingUp, Star, Tag, Upload, Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AfishaAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return (
    <div className="space-y-6 font-unbounded">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-unbounded">Афиша</h1>
          <p className="text-sm text-gray-600">Управление событиями, фильтрами и настройками афиши</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* События */}
        <Link 
          href={`/admin/afisha/events${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">События</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление всеми событиями афиши. Отметьте события как популярные, платные или рекламные
          </p>
          <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Фильтры */}
        <Link 
          href={`/admin/afisha/filters${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Фильтры</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Настройка быстрых фильтров и поисковых параметров
          </p>
          <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
            <span>Перейти к настройке</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Категории */}
        <Link 
          href={`/admin/afisha/categories${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Категории</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление категориями событий, их обложками и настройками
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Реклама */}
        <Link 
          href={`/admin/afisha/ads${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Megaphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Реклама</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление рекламными блоками на главной и в афише
          </p>
          <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Финансы */}
        <Link 
          href={`/admin/afisha/finance${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Финансы</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Статистика продаж билетов, комиссии и доходы
          </p>
          <div className="mt-4 flex items-center text-sm text-emerald-600 group-hover:text-emerald-700">
            <span>Перейти к финансам</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Аналитика */}
        <Link 
          href={`/admin/afisha/analytics${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Аналитика</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Детальная аналитика посещений, популярности событий
          </p>
          <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
            <span>Перейти к аналитике</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Модерация */}
        <Link 
          href={`/admin/afisha/moderation${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <Eye className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Модерация</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Модерация событий, комментариев и отзывов
          </p>
          <div className="mt-4 flex items-center text-sm text-red-600 group-hover:text-red-700">
            <span>Перейти к модерации</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Редакторы */}
        <Link 
          href={`/admin/afisha/editors${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-cyan-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Редакторы</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление редакторами афиши и их правами
          </p>
          <div className="mt-4 flex items-center text-sm text-cyan-600 group-hover:text-cyan-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Пакетный загрузчик мероприятий */}
        <Link 
          href={`/admin/afisha/bulk-loader${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <Upload className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Пакетный загрузчик</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Массовая загрузка мероприятий и мест из Excel файлов
          </p>
          <div className="mt-4 flex items-center text-sm text-teal-600 group-hover:text-teal-700">
            <span>Перейти к загрузчику</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Настройки */}
        <Link 
          href={`/admin/afisha/settings${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Настройки</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Общие настройки афиши и системы
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-unbounded">Статистика афиши</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Всего событий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">89</div>
            <div className="text-sm text-gray-600">Популярных событий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">15.2K</div>
            <div className="text-sm text-gray-600">Просмотров за месяц</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">₽2.4M</div>
            <div className="text-sm text-gray-600">Доход за месяц</div>
          </div>
        </div>
      </div>
    </div>
  )
}