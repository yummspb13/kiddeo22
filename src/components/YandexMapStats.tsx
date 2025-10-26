'use client'

interface YandexMapStatsProps {
  events: unknown[]
}

export default function YandexMapStats({ events }: YandexMapStatsProps) {
  // Подсчитываем статистику
  const totalEvents = events.length
  
  // События по дням недели
  const eventsByDay = events.reduce((acc, event) => {
    const day = new Date(event.startDate).toLocaleDateString('ru', { weekday: 'long' })
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostPopularDay = Object.entries(eventsByDay).reduce((a, b) => 
    eventsByDay[a[0]] > eventsByDay[b[0]] ? a : b, ['', 0]
  )

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Статистика</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Всего событий:</span>
          <span className="font-semibold">{totalEvents}</span>
        </div>
        
        
        {mostPopularDay[1] > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Популярный день:</span>
            <span className="font-semibold capitalize">{mostPopularDay[0]}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Кликните на маркер для подробностей
        </p>
      </div>
    </div>
  )
}
