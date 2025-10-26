'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SubcategorySorting() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'popularity'

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === 'popularity') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    
    // Сбрасываем страницу при изменении сортировки
    params.delete('page')
    
    const queryString = params.toString()
    router.push(`?${queryString}`, { scroll: false })
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-600">Сортировка:</span>
      <select 
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-white rounded-lg px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="popularity">По популярности</option>
        <option value="price-asc">По цене (возрастание)</option>
        <option value="price-desc">По цене (убывание)</option>
        <option value="rating">По рейтингу</option>
        <option value="distance">По расстоянию</option>
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
      </select>
    </div>
  )
}
