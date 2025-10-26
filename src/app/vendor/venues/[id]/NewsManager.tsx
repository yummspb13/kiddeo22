"use client"

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'

type NewsItem = { id: string; title: string; content?: string; imageUrl?: string; createdAt: string }

export default function NewsManager({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [currentEditImage, setCurrentEditImage] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    if (!title.trim() || !content.trim()) {
      setError('Заголовок и содержание обязательны')
      return
    }
    
    setSubmitting(true)
    setError(null)
    try {
      let imageUrl = null
      
      // Загружаем изображение на сервер, если выбрано
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('type', 'news')
        
        const uploadRes = await fetch('/api/admin/upload?key=kidsreview2025', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) {
          throw new Error('Ошибка загрузки изображения')
        }
        
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }
      
      const res = await fetch(`/api/vendor/venues/${venueId}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl, isPublished: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения')
      
      setTitle('')
      setContent('')
      setImageFile(null)
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditContent(item.content || '')
    setEditImageFile(null)
    setCurrentEditImage(item.imageUrl || null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditImageFile(null)
    setCurrentEditImage(null)
  }

  const update = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return
    
    setSubmitting(true)
    setError(null)
    try {
      let imageUrl = null
      
      // Загружаем новое изображение, если выбрано
      if (editImageFile) {
        const formData = new FormData()
        formData.append('file', editImageFile)
        formData.append('type', 'news')
        
        const uploadRes = await fetch('/api/admin/upload?key=kidsreview2025', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) {
          throw new Error('Ошибка загрузки изображения')
        }
        
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }
      
      const res = await fetch(`/api/vendor/venues/${venueId}/news`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newsId: editingId,
          title: editTitle, 
          content: editContent, 
          imageUrl: imageUrl || undefined // Не отправляем null, если изображение не изменилось
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка обновления')
      
      cancelEdit()
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const remove = async () => {
    if (!deleteId) return
    
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/news?newsId=${encodeURIComponent(deleteId)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления')
      await load()
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  }

  useEffect(() => { load() }, [venueId])

  if (loading) return <div className="text-gray-600">Загрузка новостей...</div>

  return (
    <div className="space-y-6">
      {/* Заголовок с счетчиком */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-unbounded">Новости</h2>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Доступно к публикации в этом месяце: {3 - items.length} новостей
        </div>
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="space-y-3">
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Заголовок *" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          rows={4} 
          placeholder="Содержание *" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение (необязательно)
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          {imageFile && (
            <div className="mt-2 text-sm text-green-600">
              Выбрано: {imageFile.name}
            </div>
          )}
        </div>
        <button 
          disabled={submitting || !title.trim() || !content.trim()} 
          onClick={create} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
        >
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
              {editingId === n.id ? (
                // Режим редактирования
                <div className="space-y-3">
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    placeholder="Заголовок *" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <textarea 
                    value={editContent} 
                    onChange={e => setEditContent(e.target.value)} 
                    rows={4} 
                    placeholder="Содержание *" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Изображение (необязательно)
                    </label>
                    
                    {/* Текущее изображение */}
                    {currentEditImage && !editImageFile && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Текущее изображение:</p>
                        <img 
                          src={currentEditImage} 
                          alt="current" 
                          className="w-full max-h-48 object-cover rounded-lg border" 
                        />
                      </div>
                    )}
                    
                    {/* Новое изображение */}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setEditImageFile(e.target.files?.[0] || null)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    {editImageFile && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600 mb-2">Новое изображение:</p>
                        <img 
                          src={URL.createObjectURL(editImageFile)} 
                          alt="new" 
                          className="w-full max-h-48 object-cover rounded-lg border" 
                        />
                        <p className="text-sm text-green-600 mt-1">Выбрано: {editImageFile.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={update}
                      disabled={submitting || !editTitle.trim() || !editContent.trim()} 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Сохранить
                    </button>
                    <button 
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Отмена
                    </button>
                  </div>
                </div>
              ) : (
                // Режим просмотра
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-gray-900 font-bold text-lg font-unbounded">{n.title}</div>
                      <div className="text-xs text-gray-500 font-unbounded">{new Date(n.createdAt).toLocaleString('ru-RU')}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(n)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(n.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {n.imageUrl && (
                    <img src={n.imageUrl} alt="news" className="mt-3 w-full max-h-80 object-cover rounded-lg border" />
                  )}
                  {n.content && (
                    <div className="mt-2 text-gray-800 whitespace-pre-line font-unbounded">{n.content}</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-4">Вы уверены, что хотите удалить эту новость?</p>
            <p className="text-red-600 text-sm mb-2 font-medium">
              ⚠️ При удалении новости, лимит не обновится! Обновление лимита будет только с 1 числа следующего месяца.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Доступно к публикации в этом месяце: {3 - items.length} новостей.
            </p>
            <div className="flex gap-3">
              <button
                onClick={remove}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Удалить
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


