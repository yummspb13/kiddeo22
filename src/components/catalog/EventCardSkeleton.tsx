"use client"

export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden animate-pulse">
      {/* Изображение */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Контент */}
      <div className="p-4">
        {/* Заголовок */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
        
        {/* Описание */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Мета-информация */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        
        {/* Кнопка */}
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export function EventListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  )
}
