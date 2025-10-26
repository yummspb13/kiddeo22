"use client"

import { useEffect, useState } from 'react'
import { Check, X, MessageSquare, Send } from 'lucide-react'

type QAItem = {
  id: string
  text: string
  author?: string
  createdAt?: string
  status?: 'MODERATION' | 'APPROVED' | 'REJECTED'
  answer?: string
}

export default function QAManager({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/qa`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      setItems(Array.isArray(data.qa) ? data.qa : [])
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const act = async (id: string, action: 'APPROVE' | 'REJECT' | 'ANSWER') => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, answer: answers[id] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения')
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => { load() }, [venueId])

  if (loading) return <div className="text-gray-600">Загрузка вопросов...</div>

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {items.length === 0 ? (
        <div className="text-gray-600">Пока нет вопросов</div>
      ) : (
        <div className="space-y-4">
          {items.map((q) => (
            <div key={q.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <MessageSquare className="w-4 h-4" /> {q.author || 'Аноним'}
                  </div>
                  <div className="text-gray-700 mt-2">{q.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{q.createdAt ? new Date(q.createdAt).toLocaleString('ru-RU') : ''}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{q.status}</div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <button disabled={saving || q.status === 'APPROVED'} onClick={() => act(q.id, 'APPROVE')} className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 flex items-center gap-2"><Check className="w-4 h-4" /> Одобрить</button>
                <button disabled={saving || q.status === 'REJECTED'} onClick={() => act(q.id, 'REJECT')} className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 flex items-center gap-2"><X className="w-4 h-4" /> Отклонить</button>
              </div>

              <div className="mt-3">
                <label className="text-sm font-bold text-gray-700 mb-1 block">Ответ</label>
                <div className="flex gap-2">
                  <input value={answers[q.id] ?? q.answer ?? ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Напишите ответ..." />
                  <button disabled={saving || !(answers[q.id] ?? '').trim()} onClick={() => act(q.id, 'ANSWER')} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Send className="w-4 h-4" /> Ответить</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


