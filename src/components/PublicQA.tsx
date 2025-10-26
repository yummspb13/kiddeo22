"use client"

import { useEffect, useState } from 'react'
import { MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react'

type QAItem = { 
  id: string
  text: string
  author?: string
  createdAt?: string
  answer?: string
  status?: 'MODERATION' | 'APPROVED' | 'REJECTED'
}

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
    <div className="space-y-8">

      {/* Список Q&A */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="ml-3 text-gray-600 font-unbounded">Загрузка вопросов...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">Пока нет вопросов</h3>
            <p className="text-gray-600 font-unbounded">Будьте первым, кто задаст вопрос!</p>
          </div>
        ) : (
          items.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Заголовок вопроса */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 font-unbounded">{q.author || 'Аноним'}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500 font-unbounded">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('ru-RU') : ''}
                    </span>
                  </div>
                  <div className="text-gray-800 text-lg leading-relaxed font-unbounded">{q.text}</div>
                </div>
              </div>

              {/* Ответ */}
              {q.answer && (
                <div className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-violet-700 font-unbounded">Ответ от заведения</span>
                  </div>
                  <div className="text-gray-800 leading-relaxed font-unbounded">{q.answer}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Форма отправки */}
      <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-200 rounded-2xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">Задайте свой вопрос</h3>
          <p className="text-gray-600 font-unbounded">Мы ответим вам в ближайшее время</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                Ваше имя (необязательно)
              </label>
              <input 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                placeholder="Введите ваше имя" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                Ваш вопрос
              </label>
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                rows={3} 
                placeholder="Напишите ваш вопрос..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none font-unbounded"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              disabled={submitting || !text.trim()} 
              onClick={submit} 
              className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 hover:from-violet-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-unbounded"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Отправить вопрос
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


