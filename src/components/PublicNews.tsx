"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type NewsItem = { id: string; title: string; content?: string; imageUrl?: string; createdAt: string }

export default function PublicNews({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  const load = async () => {
    console.log('🔍 PublicNews: Loading news for venueId:', venueId)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/news`, { cache: 'no-store' })
      console.log('🔍 PublicNews: API response status:', res.status)
      const data = await res.json()
      console.log('🔍 PublicNews: API response data:', data)
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки новостей')
      setItems(Array.isArray(data.news) ? data.news : [])
      console.log('🔍 PublicNews: Set items:', data.news)
    } catch (e: any) {
      console.error('🔍 PublicNews: Error loading news:', e)
      setError(e.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    console.log('🔍 PublicNews: useEffect triggered for venueId:', venueId)
    load() 
  }, [venueId])

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-unbounded mb-2">
          📰 Новости
        </h2>
        <p className="text-gray-600 font-unbounded">
          Следите за последними событиями и обновлениями
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 font-unbounded">Загружаем новости...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 font-unbounded">{error}</p>
          <button 
            onClick={load}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-unbounded"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg font-unbounded">Пока нет новостей</p>
          <p className="text-gray-400 text-sm font-unbounded mt-1">Следите за обновлениями!</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          {items.map((item) => (
            <article 
              key={item.id} 
              className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded-lg p-4 -m-4 transition-colors duration-200"
              onClick={() => setSelectedNews(item)}
            >
              <div className="flex items-start space-x-4">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-unbounded hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-3 font-unbounded line-clamp-3">
                    {item.content}
                  </p>
                  <time className="text-sm text-gray-400 font-unbounded">
                    {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Модальное окно для просмотра новости */}
      {selectedNews && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Заголовок модального окна */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-unbounded">
                {selectedNews.title}
              </h2>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Контент модального окна */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Изображение */}
              {selectedNews.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Текст новости */}
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed font-unbounded whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>

              {/* Дата */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <time className="text-sm text-gray-500 font-unbounded">
                  Опубликовано: {new Date(selectedNews.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}