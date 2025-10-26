"use client"

import { useEffect, useState } from 'react'
import { Check, X, MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react'

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

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      <span className="ml-2 text-gray-600">Загрузка вопросов...</span>
    </div>
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Одобрен'
      case 'REJECTED': return 'Отклонен'
      default: return 'На модерации'
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Пока нет вопросов</h3>
          <p className="text-gray-600">Когда посетители зададут вопросы, они появятся здесь</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Заголовок вопроса */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{q.author || 'Аноним'}</div>
                    <div className="text-sm text-gray-500">
                      {q.createdAt ? new Date(q.createdAt).toLocaleString('ru-RU') : ''}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(q.status || 'MODERATION')}`}>
                  {getStatusIcon(q.status || 'MODERATION')}
                  {getStatusText(q.status || 'MODERATION')}
                </div>
              </div>

              {/* Текст вопроса */}
              <div className="text-gray-800 text-lg leading-relaxed mb-4">
                {q.text}
              </div>

              {/* Ответ (если есть) */}
              {q.answer && (
                <div className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-violet-700">Ваш ответ</span>
                  </div>
                  <div className="text-gray-800">{q.answer}</div>
                </div>
              )}

              {/* Кнопки действий */}
              {q.status === 'MODERATION' && (
                <div className="flex flex-wrap gap-3 mb-4">
                  <button 
                    disabled={saving} 
                    onClick={() => act(q.id, 'APPROVE')} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Одобрить
                  </button>
                  <button 
                    disabled={saving} 
                    onClick={() => act(q.id, 'REJECT')} 
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Отклонить
                  </button>
                </div>
              )}

              {/* Форма ответа */}
              {q.status === 'APPROVED' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ответ на вопрос
                  </label>
                  <div className="flex gap-3">
                    <input 
                      value={answers[q.id] ?? q.answer ?? ''} 
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent" 
                      placeholder="Напишите ответ на вопрос..." 
                    />
                    <button 
                      disabled={saving || !(answers[q.id] ?? '').trim()} 
                      onClick={() => act(q.id, 'ANSWER')} 
                      className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Ответить
                    </button>
                  </div>
                </div>
              )}

              {/* Статус отклонения */}
              {q.status === 'REJECTED' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Вопрос отклонен</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


