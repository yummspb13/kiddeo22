'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface EventsSortProps {
  citySlug: string
}

export default function EventsSort({ citySlug }: EventsSortProps) {
  const [sortBy, setSortBy] = useState('date')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentSort = searchParams.get('sortBy')
    if (currentSort) {
      setSortBy(currentSort)
    }
  }, [searchParams])

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    
    // Обновляем URL с новым параметром сортировки, сохраняя текущую страницу
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', newSortBy)
    
    // Явно сохраняем текущую страницу, если она есть
    const currentPage = searchParams.get('page')
    if (currentPage) {
      params.set('page', currentPage)
    }
    
    console.log('EventsSort changing to:', newSortBy, 'with params:', params.toString())
    router.push(`/city/${citySlug}/cat/events?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Сортировка:</span>
      <select 
        value={sortBy}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-white rounded-lg px-3 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="date">По дате</option>
        <option value="price">По цене</option>
        <option value="popularity">По популярности</option>
        <option value="newest">По новизне</option>
      </select>
    </div>
  )
}
