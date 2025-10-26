"use client"

import { useEffect, useState } from 'react'

type QAItem = { id: string; text: string; author?: string; createdAt?: string; answer?: string }

export default function PublicQA({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/qa`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      setItems(Array.isArray(data.qa) ? data.qa : [])
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: author || 'Аноним' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки')
      setText('')
      setAuthor('')
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка отправки')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => { load() }, [venueId])

  return (
    <div className="space-y-6">
      {/* Список Q&A */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-600">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">Вопросов пока нет. Будьте первым!</div>
        ) : (
          items.map((q) => (
            <div key={q.id} className="border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">{q.author || 'Аноним'} • {q.createdAt ? new Date(q.createdAt).toLocaleDateString('ru-RU') : ''}</div>
              <div className="text-gray-900 font-bold mt-1">{q.text}</div>
              {q.answer && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Ответ</div>
                  <div className="text-gray-800">{q.answer}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Форма отправки */}
      <div className="bg-gray-50 border rounded-xl p-4">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Ваше имя (необязательно)" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <div className="md:col-span-2">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Ваш вопрос..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <button disabled={submitting || !text.trim()} onClick={submit} className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-lg font-unbounded text-sm disabled:opacity-50">
          {submitting ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </div>
  )
}


