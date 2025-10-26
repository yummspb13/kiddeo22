'use client'

import { useState } from 'react'
import { Search, Calendar, MapPin, DollarSign, Users, Square, Star, Settings } from 'lucide-react'

// Типы для фильтров
type FilterType = 'SEARCH' | 'DATE_TIME' | 'LOCATION' | 'PRICE' | 'CAPACITY' | 'AREA' | 'RATING' | 'AMENITIES' | 'CUSTOM'

interface FilterConfig {
  id: number
  type: FilterType
  label: string
  key: string
  isRequired: boolean
  isVisible: boolean
  order: number
  config: unknown
}

interface DynamicFiltersProps {
  filters: FilterConfig[]
  onFilterChange: (key: string, value: unknown) => void
  className?: string
}

const filterIcons = {
  SEARCH: Search,
  DATE_TIME: Calendar,
  LOCATION: MapPin,
  PRICE: DollarSign,
  CAPACITY: Users,
  AREA: Square,
  RATING: Star,
  AMENITIES: Settings,
  CUSTOM: Settings
}

export default function DynamicFilters({ filters, onFilterChange, className = '' }: DynamicFiltersProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  const handleFilterChange = (key: string, value: unknown) => {
    setFilterValues(prev => ({ ...prev, [key]: value }))
    onFilterChange(key, value)
  }

  const renderFilter = (filter: FilterConfig) => {
    const Icon = filterIcons[filter.type] || Settings

    switch (filter.type) {
      case 'SEARCH':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {filter.label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={(filter.config as any).placeholder || 'Поиск...'}
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        )

      case 'DATE_TIME':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {filter.label}
            </label>
            <input
              type="date"
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {(filter.config as any).includeTime && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Начнем в</label>
                  <select
                    value={filterValues[`${filter.key}_start`] || ''}
                    onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {(filter.config as any).timeSlots?.map((time: string) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Закончим в</label>
                  <select
                    value={filterValues[`${filter.key}_end`] || ''}
                    onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {(filter.config as any).timeSlots?.map((time: string) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )

      case 'LOCATION':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {filter.label}
            </label>
            <select
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {(filter.config as any).options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )

      case 'PRICE':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{filter.label}</span>
            </div>
            <div className="space-y-2">
              {(filter.config as any).ranges?.map((range: any, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterValues[`${filter.key}_${index}`] || false}
                    onChange={(e) => handleFilterChange(`${filter.key}_${index}`, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'CAPACITY':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{filter.label}</span>
            </div>
            <div className="space-y-2">
              {(filter.config as any).options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterValues[`${filter.key}_${index}`] || false}
                    onChange={(e) => handleFilterChange(`${filter.key}_${index}`, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'AREA':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{filter.label}</span>
            </div>
            <div className="space-y-2">
              {(filter.config as any).options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterValues[`${filter.key}_${index}`] || false}
                    onChange={(e) => handleFilterChange(`${filter.key}_${index}`, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'RATING':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{filter.label}</span>
            </div>
            <div className="space-y-2">
              {(filter.config as any).options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterValues[`${filter.key}_${index}`] || false}
                    onChange={(e) => handleFilterChange(`${filter.key}_${index}`, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'AMENITIES':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{filter.label}</span>
            </div>
            <div className="space-y-2">
              {(filter.config as any).options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterValues[`${filter.key}_${index}`] || false}
                    onChange={(e) => handleFilterChange(`${filter.key}_${index}`, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const visibleFilters = filters
    .filter(filter => filter.isVisible)
    .sort((a, b) => a.order - b.order)

  if (visibleFilters.length === 0) {
    return null
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-6 sticky top-24 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Параметры подбора</h3>
      {visibleFilters.map(renderFilter)}
    </div>
  )
}
