"use client"

import { useEffect, useState } from 'react'

type NewsItem = { id: string; title: string; text?: string; imageUrl?: string; createdAt: string }

export default function PublicNews({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/news`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки новостей')
      setItems(Array.isArray(data.news) ? data.news : [])
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [venueId])

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Новости</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">Пока нет новостей</div>
      ) : (
        <div className="space-y-6">
          {items.map(n => (
            <div key={n.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-900 font-bold text-lg font-unbounded">{n.title}</div>
                  <div className="text-xs text-gray-500 font-unbounded">{new Date(n.createdAt).toLocaleString('ru-RU')}</div>
                </div>
              </div>
              {n.imageUrl && (
                <img src={n.imageUrl} alt="news" className="mt-3 w-full max-h-80 object-cover rounded-lg border" />
              )}
              {n.text && (
                <div className="mt-2 text-gray-800 whitespace-pre-line font-unbounded">{n.text}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


