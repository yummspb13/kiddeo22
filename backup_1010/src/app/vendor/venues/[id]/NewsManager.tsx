"use client"

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

type NewsItem = { id: string; title: string; text?: string; imageUrl?: string; createdAt: string }

export default function NewsManager({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/news`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки новостей')
      setItems(Array.isArray(data.news) ? data.news : [])
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text, imageUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения')
      setTitle('')
      setText('')
      setImageUrl('')
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/news?newsId=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления')
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    }
  }

  useEffect(() => { load() }, [venueId])

  if (loading) return <div className="text-gray-600">Загрузка новостей...</div>

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Текст" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Ссылка на изображение (необязательно)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <button disabled={submitting || !title.trim()} onClick={create} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Опубликовать
        </button>
        <div className="text-xs text-gray-500">Лимит: 3 новости в месяц</div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-gray-600">Новостей пока нет</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-900 font-bold">{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('ru-RU')}</div>
                </div>
                <button onClick={() => remove(n.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
              {n.imageUrl && (
                <img src={n.imageUrl} alt="news" className="mt-3 w-full max-h-64 object-cover rounded-lg border" />
              )}
              {n.text && (
                <div className="mt-2 text-gray-800 whitespace-pre-line">{n.text}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}


