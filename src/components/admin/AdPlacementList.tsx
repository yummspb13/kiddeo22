// src/components/admin/AdPlacementList.tsx
"use client"

interface AdPlacement {
  id: number
  page: string
  position: 'HERO' | 'HERO_BELOW' | 'INLINE' | 'SIDEBAR'
  title: string
  imageUrl?: string
  hrefUrl?: string
  startsAt?: Date
  endsAt?: Date
  order: number
  isActive: boolean
  cityId?: number | null
  weight: number
  city?: { name: string }
  events?: { type: string; count: number }[]
}

interface AdPlacementListProps {
  placements: AdPlacement[]
  cities: Array<{ id: number; name: string }>
  onEdit: (placement: AdPlacement) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
}

const POSITION_LABELS = {
  'HERO': 'Главный баннер',
  'HERO_BELOW': 'Под главным',
  'INLINE': 'Внутри контента',
  'SIDEBAR': 'Боковая панель',
  'RECOMMENDED_VENUES': 'Рекомендуемые места'
}

const PAGE_LABELS = {
  'afisha': 'Афиша',
  'venues': 'Места',
  'blog': 'Блог'
}

export default function AdPlacementList({ 
  placements, 
  cities, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: AdPlacementListProps) {
  const sortedPlacements = [...placements].sort((a, b) => a.order - b.order)

  const isCurrentlyActive = (placement: AdPlacement) => {
    if (!placement.isActive) return false
    const now = new Date()
    const startsAt = placement.startsAt ? new Date(placement.startsAt) : null
    const endsAt = placement.endsAt ? new Date(placement.endsAt) : null
    
    if (startsAt && now < startsAt) return false
    if (endsAt && now > endsAt) return false
    return true
  }

  const getEventStats = (placement: AdPlacement) => {
    if (!placement.events || placement.events.length === 0) {
      return { impressions: 0, clicks: 0, ctr: 0 }
    }
    
    const impressions = placement.events.find(e => e.type === 'IMPRESSION')?.count || 0
    const clicks = placement.events.find(e => e.type === 'CLICK')?.count || 0
    const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : 0
    
    return { impressions, clicks, ctr }
  }

  return (
    <div className="space-y-4">
      {sortedPlacements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет рекламных слотов
        </div>
      ) : (
        sortedPlacements.map(placement => {
          const isActive = isCurrentlyActive(placement)
          const stats = getEventStats(placement)
          
          return (
            <div key={placement.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{placement.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'Активен' : 'Неактивен'}
                    </span>
                    <span className="text-xs text-gray-500">#{placement.order}</span>
                    <span className="text-xs text-gray-500">Вес: {placement.weight}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Позиция:</span> {POSITION_LABELS[placement.position]} • 
                    <span className="font-medium"> Страница:</span> {PAGE_LABELS[placement.page as keyof typeof PAGE_LABELS] || placement.page} • 
                    <span className="font-medium"> Город:</span> {
                      placement.cityId 
                        ? cities.find(c => c.id === placement.cityId)?.name || 'Неизвестно'
                        : 'Все города'
                    }
                  </div>

                  {placement.hrefUrl && (
                    <div className="text-sm text-blue-600 mb-2">
                      <a href={placement.hrefUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {placement.hrefUrl}
                      </a>
                    </div>
                  )}

                  {placement.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={placement.imageUrl} 
                        alt={placement.title}
                        className="max-w-xs max-h-20 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-2">
                    {placement.startsAt && (
                      <span>Начало: {new Date(placement.startsAt).toLocaleString('ru-RU')}</span>
                    )}
                    {placement.endsAt && (
                      <span> • Конец: {new Date(placement.endsAt).toLocaleString('ru-RU')}</span>
                    )}
                  </div>

                  {/* Статистика */}
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Показы: <strong>{stats.impressions}</strong></span>
                    <span>Клики: <strong>{stats.clicks}</strong></span>
                    <span>CTR: <strong>{stats.ctr}%</strong></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onToggleActive(placement.id, !placement.isActive)}
                    className={`px-3 py-1 text-xs rounded ${
                      placement.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {placement.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  
                  <button
                    onClick={() => onEdit(placement)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Редактировать
                  </button>
                  
                  <button
                    onClick={() => onDelete(placement.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
