'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Filter, Calendar, MapPin, DollarSign, Users, Clock, Search } from 'lucide-react'
import CalendarPopover from './CalendarPopover'

interface ExpandableFiltersProps {
  selectedDate?: string | null
  onDateChange?: (date: string | null) => void
  onFilterChange?: (filters: unknown) => void
}

export default function ExpandableFilters({ 
  selectedDate, 
  onDateChange, 
  onFilterChange 
}: ExpandableFiltersProps) {
  const pathname = usePathname()
  const sp = useSearchParams()
  const router = useRouter()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    q: sp.get('q') ?? '',
    free: sp.get('free') === '1',
    dateFrom: sp.get('dateFrom') ?? '',
    dateTo: sp.get('dateTo') ?? '',
    location: '',
    priceMin: sp.get('priceMin') ?? '',
    priceMax: sp.get('priceMax') ?? '',
    ageMin: sp.get('ageMin') ?? '',
    ageMax: sp.get('ageMax') ?? '',
    category: '',
    time: ''
  })

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const setAgeRange = (min: string, max: string) => {
    const newFilters = { ...filters, ageMin: min, ageMax: max }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleDateChange = (date: string) => {
    const newFilters = { ...filters, dateFrom: date, dateTo: date }
    setFilters(newFilters)
    onDateChange?.(date)
    onFilterChange?.(newFilters)
  }

  const applyFilters = () => {
    const next = new URLSearchParams(sp.toString())

    function put(name: string, v: string) {
      if (v && v.trim()) next.set(name, v.trim())
      else next.delete(name)
    }
    
    put('q', filters.q)
    put('priceMin', filters.priceMin)
    put('priceMax', filters.priceMax)
    put('dateFrom', filters.dateFrom)
    put('dateTo', filters.dateTo)
    put('ageMin', filters.ageMin)
    put('ageMax', filters.ageMax)

    if (filters.free) next.set('free', '1')
    else next.delete('free')

    // при изменении фильтров сбрасываем пагинацию
    next.delete('page')

    const y = typeof window !== 'undefined' ? window.scrollY : 0
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => window.scrollTo({ top: y }))
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      q: '',
      free: false,
      dateFrom: '',
      dateTo: '',
      location: '',
      priceMin: '',
      priceMax: '',
      ageMin: '',
      ageMax: '',
      category: '',
      time: ''
    }
    setFilters(clearedFilters)
    onDateChange?.(null)
    onFilterChange?.(clearedFilters)
    
    // Очищаем URL
    const next = new URLSearchParams(sp.toString())
    ;['q','priceMin','priceMax','dateFrom','dateTo','free','ageMin','ageMax','page'].forEach(k => next.delete(k))
    const y = typeof window !== 'undefined' ? window.scrollY : 0
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => window.scrollTo({ top: y }))
    }
  }

  // Синхронизируем с внешним selectedDate
  useEffect(() => {
    setFilters(prev => ({ ...prev, dateFrom: selectedDate ?? '', dateTo: selectedDate ?? '' }))
  }, [selectedDate])

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Поиск и основные фильтры */}
        <div className="rounded-2xl border bg-white p-3 sm:p-4 mb-4">
          <div className="flex flex-col gap-3">
            {/* 1-я строка: поиск + бесплатно + кнопки */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  placeholder="Поиск по названию и описанию"
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <label className="inline-flex items-center gap-2 select-none">
                <input 
                  type="checkbox" 
                  checked={filters.free} 
                  onChange={(e) => handleFilterChange('free', e.target.checked)} 
                  className="h-4 w-4"
                />
                Бесплатно
              </label>
              <div className="ms-auto flex gap-2">
                <button 
                  type="button"
                  onClick={applyFilters} 
                  className="h-10 px-4 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Применить
                </button>
                <button 
                  type="button"
                  onClick={clearFilters} 
                  className="h-10 px-4 rounded-md border hover:bg-gray-50 transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>

            {/* 2-я строка: компактная 12-колоночная сетка */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Цена */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-2">
                  <input 
                    value={filters.priceMin} 
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)} 
                    inputMode="numeric" 
                    placeholder="Цена от"
                    className="h-10 w-full flex-1 rounded-md border px-3"
                  />
                  <span className="text-gray-400">—</span>
                  <input 
                    value={filters.priceMax} 
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)} 
                    inputMode="numeric" 
                    placeholder="Цена до"
                    className="h-10 w-full flex-1 rounded-md border px-3"
                  />
                </div>
              </div>

              {/* Даты */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <CalendarPopover
                      value={filters.dateFrom || undefined}
                      onChange={(v) => handleFilterChange('dateFrom', v || '')}
                      anchorClassName="w-full h-10 rounded-md border px-3 py-2 text-left"
                      placeholder="Дата от"
                    />
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="flex-1">
                    <CalendarPopover
                      value={filters.dateTo || undefined}
                      onChange={(v) => handleFilterChange('dateTo', v || '')}
                      anchorClassName="w-full h-10 rounded-md border px-3 py-2 text-left"
                      placeholder="Дата до"
                    />
                  </div>
                </div>
              </div>

              {/* Возраст */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-2">
                  <input 
                    value={filters.ageMin} 
                    onChange={(e) => handleFilterChange('ageMin', e.target.value)} 
                    inputMode="numeric" 
                    placeholder="Возраст от"
                    className="h-10 w-full flex-1 rounded-md border px-3"
                  />
                  <span className="text-gray-400">—</span>
                  <input 
                    value={filters.ageMax} 
                    onChange={(e) => handleFilterChange('ageMax', e.target.value)} 
                    inputMode="numeric" 
                    placeholder="Возраст до"
                    className="h-10 w-full flex-1 rounded-md border px-3"
                  />
                </div>
              </div>
            </div>

            {/* Быстрые пресеты возраста */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Любой', min: '', max: '' },
                { label: '0–3', min: '0', max: '3' },
                { label: '4–7', min: '4', max: '7' },
                { label: '8–12', min: '8', max: '12' },
                { label: '13–16', min: '13', max: '16' },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setAgeRange(preset.min, preset.max)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    filters.ageMin === preset.min && filters.ageMax === preset.max
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопка показать/скрыть дополнительные фильтры */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">
              {isExpanded ? 'Скрыть дополнительные фильтры' : 'Показать дополнительные фильтры'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Дополнительные фильтры */}
        {isExpanded && (
          <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Местоположение */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Район/Метро
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Любой район</option>
                  <option value="center">Центр</option>
                  <option value="north">Север</option>
                  <option value="south">Юг</option>
                  <option value="east">Восток</option>
                  <option value="west">Запад</option>
                </select>
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все категории</option>
                  <option value="theater">Театр</option>
                  <option value="music">Музыка</option>
                  <option value="sport">Спорт</option>
                  <option value="workshop">Мастер-класс</option>
                  <option value="education">Образование</option>
                  <option value="exhibition">Выставка</option>
                </select>
              </div>

              {/* Время */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Время
                </label>
                <select
                  value={filters.time}
                  onChange={(e) => handleFilterChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Любое время</option>
                  <option value="morning">Утром (6:00-12:00)</option>
                  <option value="afternoon">Днем (12:00-18:00)</option>
                  <option value="evening">Вечером (18:00-24:00)</option>
                </select>
              </div>

              {/* Дополнительные фильтры */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительно
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">С билетами</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">На выходных</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Популярные</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
