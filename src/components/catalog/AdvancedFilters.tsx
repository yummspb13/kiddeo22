"use client"

import { useState, useEffect } from "react"
import { City } from "@/lib/types"

interface FilterState {
  ageFrom: number | null
  ageTo: number | null
  dateFilter: "today" | "tomorrow" | "weekend" | "all" | null
  priceFilter: "free" | "paid" | "all" | null
  indoorFilter: "indoor" | "outdoor" | "all" | null
  district: string | null
  radius: number | null
  priceFrom: number | null
  priceTo: number | null
}

interface AdvancedFiltersProps {
  cities: City[]
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

const DISTRICTS = [
  "Центр", "Север", "Юг", "Восток", "Запад", 
  "СВАО", "СЗАО", "ЮВАО", "ЮЗАО", "ЗАО", "ВАО"
]

export default function AdvancedFilters({ 
  cities, 
  onFiltersChange, 
  initialFilters = {} 
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ageFrom: null,
    ageTo: null,
    dateFilter: null,
    priceFilter: null,
    indoorFilter: null,
    district: null,
    radius: null,
    priceFrom: null,
    priceTo: null,
    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      ageFrom: null,
      ageTo: null,
      dateFilter: null,
      priceFilter: null,
      indoorFilter: null,
      district: null,
      radius: null,
      priceFrom: null,
      priceTo: null,
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== null && value !== "").length
  }

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Фильтры</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span className="text-sm text-blue-600">
              {getActiveFiltersCount()} активных
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? "Свернуть" : "Развернуть"}
          </button>
        </div>
      </div>

      {/* Основные фильтры - всегда видны */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Возраст */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Возраст
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={filters.ageFrom || ""}
              onChange={(e) => updateFilter("ageFrom", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
              max="18"
            />
            <input
              type="number"
              placeholder="До"
              value={filters.ageTo || ""}
              onChange={(e) => updateFilter("ageTo", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
              max="18"
            />
          </div>
        </div>

        {/* Дата */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Когда
          </label>
          <select
            value={filters.dateFilter || ""}
            onChange={(e) => updateFilter("dateFilter", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Любое время</option>
            <option value="today">Сегодня</option>
            <option value="tomorrow">Завтра</option>
            <option value="weekend">В эти выходные</option>
          </select>
        </div>

        {/* Цена */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена
          </label>
          <select
            value={filters.priceFilter || ""}
            onChange={(e) => updateFilter("priceFilter", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Любая</option>
            <option value="free">Бесплатно</option>
            <option value="paid">Платно</option>
          </select>
        </div>

        {/* Место */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Место
          </label>
          <select
            value={filters.indoorFilter || ""}
            onChange={(e) => updateFilter("indoorFilter", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Любое</option>
            <option value="indoor">В помещении</option>
            <option value="outdoor">На улице</option>
          </select>
        </div>
      </div>

      {/* Дополнительные фильтры */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pt-4 border-t">
          {/* Район */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Район
            </label>
            <select
              value={filters.district || ""}
              onChange={(e) => updateFilter("district", e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Любой район</option>
              {DISTRICTS.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Радиус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Радиус (км)
            </label>
            <select
              value={filters.radius || ""}
              onChange={(e) => updateFilter("radius", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Любой</option>
              <option value="1">1 км</option>
              <option value="3">3 км</option>
              <option value="5">5 км</option>
              <option value="10">10 км</option>
              <option value="20">20 км</option>
            </select>
          </div>

          {/* Ценовой диапазон */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена (руб.)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="От"
                value={filters.priceFrom || ""}
                onChange={(e) => updateFilter("priceFrom", e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
              />
              <input
                type="number"
                placeholder="До"
                value={filters.priceTo || ""}
                onChange={(e) => updateFilter("priceTo", e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Очистить все
        </button>
        <div className="text-sm text-gray-500">
          Найдено: <span className="font-medium">0</span> результатов
        </div>
      </div>
    </div>
  )
}
