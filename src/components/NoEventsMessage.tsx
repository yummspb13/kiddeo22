'use client'

import { useRouter } from 'next/navigation'

export default function NoEventsMessage() {
  const router = useRouter()

  const handleResetFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('dateFrom')
    url.searchParams.delete('dateTo')
    url.searchParams.delete('categories')
    url.searchParams.delete('ageMin')
    url.searchParams.delete('ageMax')
    url.searchParams.delete('free')
    url.searchParams.delete('q')
    url.searchParams.delete('page')
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleClearSearch = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('q')
    url.searchParams.delete('page')
    router.push(url.pathname + url.search, { scroll: false })
  }

  return (
    <div className="col-span-2 text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">События не найдены</h3>
      <p className="text-gray-500 mb-6">Попробуйте изменить параметры поиска или фильтры</p>
      <div className="flex justify-center space-x-4">
        <button 
          onClick={handleResetFilters}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Сбросить фильтры
        </button>
        <button 
          onClick={handleClearSearch}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Очистить поиск
        </button>
      </div>
    </div>
  )
}
