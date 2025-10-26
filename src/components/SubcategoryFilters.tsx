'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterState {
  price: string
  district: string
  age: string
  rating: string
  sort: string
  page: number
}

export default function SubcategoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterState>({
    price: searchParams.get('price') || '',
    district: searchParams.get('district') || '',
    age: searchParams.get('age') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'popularity',
    page: parseInt(searchParams.get('page') || '1')
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'popularity' && value !== '1') {
        params.set(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    router.push(`?${queryString}`, { scroll: false })
  }

  const resetFilters = () => {
    setFilters({
      price: '',
      district: '',
      age: '',
      rating: '',
      sort: 'popularity',
      page: 1
    })
    router.push('?', { scroll: false })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Фильтры</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
          <select 
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Любая</option>
            <option value="0-500">До 500 ₽</option>
            <option value="500-1000">500-1000 ₽</option>
            <option value="1000-2000">1000-2000 ₽</option>
            <option value="2000+">От 2000 ₽</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
          <select 
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Любой</option>
            <option value="Центральный">Центральный</option>
            <option value="Северный">Северный</option>
            <option value="Южный">Южный</option>
            <option value="Восточный">Восточный</option>
            <option value="Западный">Западный</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
          <select 
            value={filters.age}
            onChange={(e) => handleFilterChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Любой</option>
            <option value="0-3">0-3 года</option>
            <option value="3-6">3-6 лет</option>
            <option value="6-12">6-12 лет</option>
            <option value="12+">12+ лет</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг</label>
          <select 
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Любой</option>
            <option value="4.5">4.5+ звезд</option>
            <option value="4.0">4.0+ звезд</option>
            <option value="3.5">3.5+ звезд</option>
            <option value="3.0">3.0+ звезд</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Применить фильтры
        </button>
        <button 
          onClick={resetFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Сбросить
        </button>
      </div>
    </div>
  )
}
