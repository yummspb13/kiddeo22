// src/components/admin/QuickFilterList.tsx
"use client"

interface QuickFilter {
  id: number
  cityId?: number | null
  page: string
  label: string
  queryJson: unknown
  order: number
  isActive: boolean
  city?: { name: string }
}

interface QuickFilterListProps {
  filters: QuickFilter[]
  cities: Array<{ id: number; name: string }>
  onEdit: (filter: QuickFilter) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
}

export default function QuickFilterList({ 
  filters, 
  cities, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: QuickFilterListProps) {
  const sortedFilters = [...filters].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      {sortedFilters.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет быстрых фильтров
        </div>
      ) : (
        sortedFilters.map(filter => (
          <div key={filter.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{filter.label}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    filter.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {filter.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                  <span className="text-xs text-gray-500">#{filter.order}</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Город:</span> {
                    filter.cityId 
                      ? cities.find(c => c.id === filter.cityId)?.name || 'Неизвестно'
                      : 'Все города'
                  } • <span className="font-medium">Страница:</span> {filter.page}
                </div>
                
                <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700">
                  {JSON.stringify(filter.queryJson, null, 2)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onToggleActive(filter.id, !filter.isActive)}
                  className={`px-3 py-1 text-xs rounded ${
                    filter.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {filter.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                
                <button
                  onClick={() => onEdit(filter)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Редактировать
                </button>
                
                <button
                  onClick={() => onDelete(filter.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
