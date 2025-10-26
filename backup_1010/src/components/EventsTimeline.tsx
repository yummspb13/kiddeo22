'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCityWeekend, getCityDayOfWeek } from '@/lib/timezone'
import SearchAutocomplete from './SearchAutocomplete'

interface EventsTimelineProps {
  categoryStats: Array<{ category: string | null; count: number }>
  ageStats: Array<{ label: string; count: number }>
  priceStats: Array<{ label: string; count: number }>
  citySlug: string
  quickFilters?: Array<{
    id: number
    label: string
    queryJson: any
    order: number
  }>
}

export default function EventsTimeline({ 
  categoryStats, 
  ageStats, 
  priceStats,
  citySlug,
  quickFilters = []
}: EventsTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<number[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Инициализируем поисковый запрос из URL
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== searchQuery) {
      setSearchQuery(q || '')
    }
  }, [searchParams, searchQuery])
  
  // Функция для проверки, является ли диапазон дат выходными
  const isWeekendRange = (dateFrom: string, dateTo: string) => {
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    const fromDay = fromDate.getDay()
    const toDay = toDate.getDay()
    
    // Проверяем, что это суббота-воскресенье (6-0)
    return fromDay === 6 && toDay === 0
  }
  
  // Получаем выбранную дату из URL
  const selectedDateFrom = searchParams.get('dateFrom')
  const selectedDateTo = searchParams.get('dateTo')
  const isDateSelected = selectedDateFrom && selectedDateTo && selectedDateFrom === selectedDateTo
  
  // Проверяем, активна ли кнопка "Сегодня"
  const todayDate = new Date().toISOString().split('T')[0]
  const isTodayActive = isDateSelected && selectedDateFrom === todayDate && selectedDateTo === todayDate
  
  // Проверяем, активен ли фильтр выходных
  const isWeekendActive = selectedDateFrom && selectedDateTo && 
    isWeekendRange(selectedDateFrom, selectedDateTo)

  // Получаем активные фильтры
  const isFreeActive = searchParams.get('free') === '1'

  const handleDateClick = (urlDate: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('dateFrom', urlDate)
    url.searchParams.set('dateTo', urlDate)
    // НЕ сбрасываем пагинацию для выбора даты
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleAllClick = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('dateFrom')
    url.searchParams.delete('dateTo')
    // НЕ сбрасываем пагинацию для "Все"
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleTodayClick = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayDate = `${year}-${month}-${day}`
    
    const url = new URL(window.location.href)
    url.searchParams.set('dateFrom', todayDate)
    url.searchParams.set('dateTo', todayDate)
    // НЕ сбрасываем пагинацию для "Сегодня"
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleSearch = (query?: string) => {
    const url = new URL(window.location.href)
    // Исправляем логику: если query передан (даже пустая строка), используем его
    const searchTerm = query !== undefined ? query : searchQuery
    if (searchTerm.trim()) {
      url.searchParams.set('q', searchTerm.trim())
    } else {
      url.searchParams.delete('q')
    }
    // При поиске сбрасываем пагинацию - это логично
    url.searchParams.delete('page')
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleFreeClick = () => {
    const url = new URL(window.location.href)
    const currentFree = url.searchParams.get('free')
    
    if (currentFree === '1') {
      // Если уже активен, убираем фильтр
      url.searchParams.delete('free')
    } else {
      // Если не активен, включаем фильтр
      url.searchParams.set('free', '1')
    }
    
    // НЕ сбрасываем пагинацию для фильтра "Бесплатно"
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleWeekendClick = () => {
    console.log('🔵 Кнопка "Выходные" нажата для города:', citySlug)
    
    const url = new URL(window.location.href)
    
    console.log('📅 Текущие даты:', { selectedDateFrom, selectedDateTo })
    console.log('🎯 Фильтр выходных активен:', isWeekendActive)
    
    if (isWeekendActive) {
      // Если уже активен, убираем фильтр
      console.log('❌ Убираем фильтр выходных')
      url.searchParams.delete('dateFrom')
      url.searchParams.delete('dateTo')
    } else {
      // Если не активен, включаем фильтр выходных
      console.log('✅ Включаем фильтр выходных для города:', citySlug)
      
      // Получаем выходные в часовом поясе города
      const { saturday, sunday } = getCityWeekend(citySlug)
      
      console.log('📅 Устанавливаем даты в часовом поясе города:', { saturday, sunday })
      
      url.searchParams.set('dateFrom', saturday)
      url.searchParams.set('dateTo', sunday)
    }
    
    // НЕ сбрасываем пагинацию для фильтра "Выходные"
    const newUrl = url.pathname + url.search
    console.log('🔗 Переходим на URL:', newUrl)
    
    router.push(newUrl, { scroll: false })
  }

  // Обработка быстрых фильтров
  const handleQuickFilterClick = (filterId: number) => {
    const url = new URL(window.location.href)
    const currentFilters = url.searchParams.get('quickFilters')?.split(',').map(Number) || []
    
    let newFilters: number[]
    if (currentFilters.includes(filterId)) {
      // Убираем фильтр
      newFilters = currentFilters.filter(id => id !== filterId)
    } else {
      // Добавляем фильтр
      newFilters = [...currentFilters, filterId]
    }
    
    if (newFilters.length > 0) {
      url.searchParams.set('quickFilters', newFilters.join(','))
    } else {
      url.searchParams.delete('quickFilters')
    }
    
    // НЕ сбрасываем пагинацию для быстрых фильтров
    router.push(url.pathname + url.search, { scroll: false })
  }

  const isQuickFilterActive = (filterId: number) => {
    const currentFilters = searchParams.get('quickFilters')?.split(',').map(Number) || []
    return currentFilters.includes(filterId)
  }

  // Функция для проверки, является ли дата выходным днем
  const isWeekendDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 6 || day === 0 // Суббота (6) или воскресенье (0)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (!category) return
    
    const url = new URL(window.location.href)
    const categoriesParam = url.searchParams.get('categories')
    const currentCategories: string[] = categoriesParam ? categoriesParam.split(',') : []
    
    if (checked) {
      if (!currentCategories.includes(category)) {
        currentCategories.push(category)
      }
    } else {
      const index = currentCategories.indexOf(category)
      if (index > -1) {
        currentCategories.splice(index, 1)
      }
    }
    
        if (currentCategories.length > 0) {
          url.searchParams.set('categories', currentCategories.join(','))
        } else {
          url.searchParams.delete('categories')
        }
        // НЕ сбрасываем пагинацию для категорий
        router.push(url.pathname + url.search, { scroll: false })
  }

  const handleAgeChange = (label: string, checked: boolean) => {
    let min: number, max: number
    
    if (label.includes('+')) {
      min = parseInt(label.replace('+ лет', ''))
      max = 99
    } else {
      const parts = label.split('–').map(Number)
      min = parts[0] || 0
      max = parts[1] || 99
    }
    
    const url = new URL(window.location.href)
    const currentAgeMin = url.searchParams.get('ageMin')
    const currentAgeMax = url.searchParams.get('ageMax')
    
    if (checked) {
      if (!currentAgeMin || min < parseInt(currentAgeMin || '0')) {
        url.searchParams.set('ageMin', min.toString())
      }
      if (!currentAgeMax || max > parseInt(currentAgeMax || '99')) {
        url.searchParams.set('ageMax', max.toString())
      }
    } else {
      url.searchParams.delete('ageMin')
      url.searchParams.delete('ageMax')
    }
    // НЕ сбрасываем пагинацию для возраста
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handlePriceChange = (label: string, checked: boolean) => {
    const url = new URL(window.location.href)
    
    if (checked) {
      if (label === 'Бесплатно') {
        url.searchParams.set('free', '1')
      } else if (label.includes('До 500')) {
        url.searchParams.set('priceMax', '500')
      } else if (label.includes('500-1000')) {
        url.searchParams.set('priceMin', '500')
        url.searchParams.set('priceMax', '1000')
      } else if (label.includes('1000+')) {
        url.searchParams.set('priceMin', '1000')
      }
    } else {
      if (label === 'Бесплатно') {
        url.searchParams.delete('free')
      } else if (label.includes('До 500')) {
        url.searchParams.delete('priceMax')
      } else if (label.includes('500-1000')) {
        url.searchParams.delete('priceMin')
        url.searchParams.delete('priceMax')
      } else if (label.includes('1000+')) {
        url.searchParams.delete('priceMin')
      }
        }
        // НЕ сбрасываем пагинацию для цены
        router.push(url.pathname + url.search, { scroll: false })
  }

  return (
    <>
      {/* Date Picker Timeline */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {/* Кнопка "Все" */}
        <button 
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            !isDateSelected 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={handleAllClick}
        >
          Все
        </button>
        
        {/* Кнопка "Сегодня" */}
        <button 
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            isTodayActive
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={handleTodayClick}
        >
          Сегодня
        </button>
        
        {/* Даты с флажками для выходных */}
        {Array.from({ length: 17 }, (_, i) => {
          const today = new Date()
          const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i + 1) // +1 чтобы начать с завтра
          const dayOfWeek = targetDate.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // воскресенье или суббота
          
          // Форматируем дату для отображения
          const day = targetDate.getDate()
          const month = targetDate.toLocaleDateString('ru', { month: 'short' })
          const dateString = `${day} ${month}`
          
          // Форматируем дату для URL (YYYY-MM-DD) - используем локальную дату без часового пояса
          const year = targetDate.getFullYear()
          const monthNum = String(targetDate.getMonth() + 1).padStart(2, '0')
          const dayNum = String(targetDate.getDate()).padStart(2, '0')
          const urlDate = `${year}-${monthNum}-${dayNum}`
          
          let flagElement = null
          
          if (isWeekend) {
            // Определяем текст флажка: СБ для субботы, ВС для воскресенья
            const flagText = dayOfWeek === 6 ? 'СБ' : 'ВС'
            
            flagElement = (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-bl-lg rounded-tr-lg font-bold">
                {flagText}
              </div>
            )
          }
          
          // Проверяем, выбрана ли эта дата
          const isSelected = isDateSelected && selectedDateFrom === urlDate
          
          return (
            <button
              key={i}
              className={`relative px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                isSelected 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleDateClick(urlDate)}
            >
              {dateString}
              {flagElement}
            </button>
          )
        })}
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-4 mb-6">
        <SearchAutocomplete 
          citySlug={citySlug}
          onSearch={handleSearch}
          initialQuery={searchQuery}
        />
        <button 
          className={`rounded-lg px-4 py-2 transition-colors ${
            isFreeActive 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={handleFreeClick}
        >
          Бесплатно
        </button>
        <button 
          className={`rounded-lg px-4 py-2 transition-colors ${
            isWeekendActive 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={handleWeekendClick}
        >
          Выходные
        </button>
        
        {/* Быстрые фильтры */}
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            className={`rounded-lg px-4 py-2 transition-colors ${
              isQuickFilterActive(filter.id)
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleQuickFilterClick(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

    </>
  )
}
