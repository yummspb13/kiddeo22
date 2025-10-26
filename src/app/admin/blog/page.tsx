// src/app/admin/blog/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { FileText, Megaphone, Settings, BarChart3, Users, Plus, Tag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPage({
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
          <h1 className="text-2xl font-bold text-gray-900">Блог</h1>
          <p className="text-sm text-gray-600">Управление контентом блога и рекламой</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Статьи */}
        <Link 
          href={`/admin/blog/articles${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Статьи</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление статьями блога, их публикацией и модерацией
          </p>
          <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Создать статью */}
        <Link 
          href={`/admin/blog/create${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Создать статью</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Создание новой статьи для блога
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
            <span>Создать статью</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Реклама */}
        <Link 
          href={`/admin/blog/ads${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Megaphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Реклама</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление рекламными блоками в блоге
          </p>
          <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Авторы */}
        <Link 
          href={`/admin/blog/authors${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Авторы</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление авторами блога и их правами
          </p>
          <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Категории */}
        <Link 
          href={`/admin/blog/categories${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <Tag className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Категории</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление категориями статей блога
          </p>
          <div className="mt-4 flex items-center text-sm text-teal-600 group-hover:text-teal-700">
            <span>Перейти к управлению</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Аналитика */}
        <Link 
          href={`/admin/blog/analytics${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Аналитика</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Статистика просмотров, популярности статей и авторов
          </p>
          <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
            <span>Перейти к аналитике</span>
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Настройки */}
        <Link 
          href={`/admin/blog/settings${k}`}
          className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Настройки</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Общие настройки блога
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика блога</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Всего статей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Активных авторов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2.4K</div>
            <div className="text-sm text-gray-600">Просмотров за месяц</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">89</div>
            <div className="text-sm text-gray-600">Комментариев</div>
          </div>
        </div>
      </div>
    </div>
  )
}
