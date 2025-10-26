'use client'

import { useState, useEffect } from 'react'
import { useAdminKey } from '@/hooks/useAdminKey'
import { useAdminData } from '@/hooks/useAdminData'
import Link from 'next/link'
import AdminFileUploader from '@/components/AdminFileUploader'
import AdminMultiUploader from '@/components/AdminMultiUploader'
import RichTextEditor from '@/components/RichTextEditor'
import { slugify, generateUniqueSlug, checkSlugExists } from '@/lib/slug-utils'

interface Ticket {
  name: string
  description: string
  price: number
  quantity: number
  isActive: boolean
}

export default function AfishaEventCreatePage() {
  const { keySuffix } = useAdminKey()
  const { data: { cities }, loading: citiesLoading } = useAdminData({ 
    cities: true
  })
  
  // Логирование для отладки
  console.log('Cities data:', cities)
  console.log('Cities loading:', citiesLoading)
  
  const [afishaCategories, setAfishaCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [fallbackCities, setFallbackCities] = useState<{ id: number; name: string; slug: string }[]>([])
  const [citiesFallbackLoading, setCitiesFallbackLoading] = useState(false)

  // Загружаем категории афиши
  useEffect(() => {
    const loadAfishaCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await fetch(`/api/admin/afisha/categories?key=kidsreview2025`)
        const data = await response.json()
        if (response.ok) {
          setAfishaCategories(data.categories || [])
        } else {
          console.error('Error loading afisha categories:', data.error)
        }
      } catch (error) {
        console.error('Error loading afisha categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadAfishaCategories()
  }, [])

  // Fallback загрузка городов, если useAdminData не работает
  useEffect(() => {
    const loadCitiesFallback = async () => {
      if (!cities || cities.length === 0) {
        try {
          setCitiesFallbackLoading(true)
          console.log('Loading cities fallback...')
          const response = await fetch(`/api/admin/cities?key=kidsreview2025`)
          const data = await response.json()
          console.log('Cities fallback response:', data)
          if (response.ok && data.cities) {
            setFallbackCities(data.cities)
          }
        } catch (error) {
          console.error('Error loading cities fallback:', error)
        } finally {
          setCitiesFallbackLoading(false)
        }
      }
    }

    loadCitiesFallback()
  }, [cities])

  const [form, setForm] = useState({
    title: '',
    slug: '',
    richDescription: '',
    venue: '',
    organizer: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    coordinates: '',
    order: 0,
    status: 'active',
    coverImage: '',
    gallery: [] as string[],
    tickets: [] as Ticket[],
    city: 'Москва',
    category: '',
    ageGroups: [] as string[],
    // Новые флаги для единой системы событий
    isPopular: false,
    isPaid: false,
    isPromoted: false,
    priority: 5,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatingSlug, setGeneratingSlug] = useState(false)
  const [slugPreview, setSlugPreview] = useState('')

  // Автогенерация slug из названия
  const handleTitleChange = async (title: string) => {
    setForm(prev => ({ ...prev, title }))
    
    if (title.trim()) {
      setGeneratingSlug(true)
      try {
        const baseSlug = slugify(title)
        setSlugPreview(baseSlug)
        
        // Генерируем уникальный slug
        const uniqueSlug = await generateUniqueSlug(title, checkSlugExists)
        setForm(prev => ({ ...prev, slug: uniqueSlug }))
      } catch (error) {
        console.error('Error generating slug:', error)
        const fallbackSlug = slugify(title)
        setForm(prev => ({ ...prev, slug: fallbackSlug }))
      } finally {
        setGeneratingSlug(false)
      }
    }
  }

  const addTicket = () => {
    setForm(prev => ({
      ...prev,
      tickets: [...prev.tickets, {
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        isActive: true
      }]
    }))
  }

  const updateTicket = (index: number, field: keyof Ticket, value: unknown) => {
    setForm(prev => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }))
  }

  const removeTicket = (index: number) => {
    setForm(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      console.log('Form data:', form)
      
      // Валидация
      if (!form.title || !form.venue || !form.startDate || !form.endDate) {
        throw new Error('Заполните обязательные поля')
      }

      // Формируем даты
      const startDateTime = new Date(`${form.startDate}T${form.startTime || '00:00'}`)
      const endDateTime = new Date(`${form.endDate}T${form.endTime || '23:59'}`)

      // Возраст: вычисляем минимальный нижний порог для ageFrom
      const AGE_GROUPS_TO_MIN: Record<string, number | null> = {
        'Любой': null,
        '0–3': 0,
        '4–7': 4,
        '8–12': 8,
        '13–16': 13,
        '16+': 16,
      }
      
      // Преобразуем значения ageGroups в формат для фильтров
      const ageGroupsMapping: Record<string, string> = {
        'Любой': 'any',
        '0–3': '0-3',
        '4–7': '4-7',
        '8–12': '8-12',
        '13–16': '13-16',
        '16+': '16-plus',
      }
      
      const selectedBounds = form.ageGroups
        .map(g => AGE_GROUPS_TO_MIN[g])
        .filter(v => v !== null && typeof v === 'number') as number[]
      const derivedAgeFrom = form.ageGroups.includes('Любой') ? null : (selectedBounds.length ? Math.min(...selectedBounds) : null)
      
      // Преобразуем ageGroups в формат для фильтров
      const mappedAgeGroups = form.ageGroups
        .map(g => ageGroupsMapping[g])
        .filter(Boolean)

      const requestData = {
        title: form.title,
        slug: form.slug,
        description: null, // Убираем обычное описание, используем только richDescription
        richDescription: form.richDescription || null,
        venue: form.venue,
        organizer: form.organizer || null,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        coordinates: form.coordinates || null,
        order: Number(form.order) || 0,
        status: form.status,
        coverImage: form.coverImage || null,
        gallery: form.gallery.length > 0 ? JSON.stringify(form.gallery) : null,
        tickets: form.tickets.length > 0 ? JSON.stringify(form.tickets) : null,
        city: form.city,
        category: form.category || null,
        ageFrom: derivedAgeFrom,
        ageGroups: mappedAgeGroups,
        // Новые флаги для единой системы событий
        isPopular: form.isPopular,
        isPaid: form.isPaid,
        isPromoted: form.isPromoted,
        priority: form.priority,
      }
      
      console.log('Sending request with data:', requestData)

      const res = await fetch(`/api/admin/afisha/events?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
      
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Ошибка сохранения')
      }
      
      const result = await res.json()
      console.log('Success response:', result)
      
      window.location.href = `/admin/afisha/events${keySuffix}`
    } catch (e: unknown) {
      console.error('Save error:', e)
      setError((e as Error)?.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-unbounded">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href={`/admin/afisha/events${keySuffix}`} className="text-gray-600 hover:text-gray-900">← Назад</Link>
          <div className="font-semibold font-unbounded">Создать мероприятие</div>
          <div />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        
        {(citiesLoading || categoriesLoading) && (
          <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Загрузка данных...
          </div>
        )}
        
        <form onSubmit={save} className="space-y-8 bg-white border rounded-lg p-6">
          {/* Основная информация */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={form.title} 
                  onChange={e => handleTitleChange(e.target.value)} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug * 
                  {generatingSlug && (
                    <span className="text-blue-600 text-xs ml-2">
                      Генерируется...
                    </span>
                  )}
                </label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={form.slug} 
                  onChange={e => setForm({ ...form, slug: e.target.value })} 
                  placeholder={slugPreview || "slug-будет-сгенерирован-автоматически"}
                  required 
                />
                {slugPreview && !generatingSlug && (
                  <div className="text-xs text-gray-500 mt-1">
                    Предварительный просмотр: {slugPreview}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Категория</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Не выбрано</option>
                  {afishaCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Город *</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={form.city} 
                  onChange={e => setForm({ ...form, city: e.target.value })} 
                  required
                >
                  {(cities && cities.length > 0 ? cities : fallbackCities).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {citiesFallbackLoading && <div className="text-sm text-gray-500 mt-1">Загрузка городов...</div>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Место проведения *</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={form.venue} 
                  onChange={e => setForm({ ...form, venue: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Организатор</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={form.organizer} 
                  onChange={e => setForm({ ...form, organizer: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Координаты (lat,lng)</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="55.7558, 37.6176"
                  value={form.coordinates} 
                  onChange={e => setForm({ ...form, coordinates: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Порядок</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.order} 
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })} 
                />
              </div>
            </div>
          </div>

          {/* Даты и время */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Даты и время</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Дата начала *</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.startDate} 
                  onChange={e => setForm({ ...form, startDate: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Время начала</label>
                <input 
                  type="time" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.startTime} 
                  onChange={e => setForm({ ...form, startTime: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Дата окончания *</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.endDate} 
                  onChange={e => setForm({ ...form, endDate: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Время окончания</label>
                <input 
                  type="time" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.endTime} 
                  onChange={e => setForm({ ...form, endTime: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Описание</h3>
            <div>
              <label className="block text-sm font-medium mb-1">
                Описание с форматированием
              </label>
              <RichTextEditor
                content={form.richDescription}
                onChange={(content) => setForm({...form, richDescription: content})}
                placeholder="Создайте красивое описание с форматированием, изображениями и ссылками..."
              />
            </div>
          </div>

          {/* Возрастные группы */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Возраст</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Для какого возраста</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Любой','0–3','4–7','8–12','13–16','16+'].map(opt => {
                  const checked = form.ageGroups.includes(opt)
                  return (
                    <label key={opt} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${checked ? 'bg-blue-50 border-blue-300' : ''}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={e => {
                          setForm(prev => {
                            const next = new Set(prev.ageGroups)
                            if (e.target.checked) next.add(opt); else next.delete(opt)
                            // если выбран «Любой», сбросить остальные; если выбраны другие — убрать «Любой»
                            if (opt === 'Любой' && e.target.checked) return { ...prev, ageGroups: ['Любой'] }
                            const arr = Array.from(next)
                            const cleaned = arr.filter(v => v !== 'Любой')
                            return { ...prev, ageGroups: cleaned }
                          })
                        }}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">Можно выбрать несколько диапазонов. Значение ageFrom вычислится автоматически.</p>
            </div>
          </div>

          {/* Флаги события */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Настройки события</h3>
            <p className="text-sm text-gray-500">Отметьте особенности события для правильного отображения на сайте.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Популярное событие */}
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600"
                  checked={form.isPopular}
                  onChange={e => setForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-gray-900">⭐ Популярное событие</div>
                  <div className="text-sm text-gray-500">Будет показано в блоке популярных событий на главной</div>
                </div>
              </label>

              {/* Платное событие */}
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600"
                  checked={form.isPaid}
                  onChange={e => setForm(prev => ({ ...prev, isPaid: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-gray-900">💰 Платное событие</div>
                  <div className="text-sm text-gray-500">Событие с платными билетами</div>
                </div>
              </label>

              {/* Реклама в афише */}
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-orange-600"
                  checked={form.isPromoted}
                  onChange={e => setForm(prev => ({ ...prev, isPromoted: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-gray-900">📢 Реклама в афише</div>
                  <div className="text-sm text-gray-500">Продвижение события в рекламных блоках</div>
                </div>
              </label>

              {/* Приоритет */}
              <div className="p-4 border rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Приоритет отображения
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.priority}
                  onChange={e => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">1 = низкий, 10 = высокий приоритет</div>
              </div>
            </div>

          </div>

          {/* Изображения */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Изображения</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Обложка</label>
              <AdminFileUploader
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Галерея (до 20 фото)</label>
              <AdminMultiUploader
                value={form.gallery}
                onChange={(urls) => setForm({ ...form, gallery: urls })}
                maxCount={20}
              />
            </div>
          </div>

          {/* Билеты */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Билеты</h3>
              <button
                type="button"
                onClick={addTicket}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Добавить билет
              </button>
            </div>
            
            {form.tickets.map((ticket, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Билет {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Название билета *</label>
                    <input 
                      className="w-full border rounded px-3 py-2" 
                      value={ticket.name} 
                      onChange={e => updateTicket(index, 'name', e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Цена (₽) *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded px-3 py-2" 
                      value={ticket.price} 
                      onChange={e => updateTicket(index, 'price', Number(e.target.value))} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Количество *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded px-3 py-2" 
                      value={ticket.quantity} 
                      onChange={e => updateTicket(index, 'quantity', Number(e.target.value))} 
                      required 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={ticket.isActive} 
                      onChange={e => updateTicket(index, 'isActive', e.target.checked)} 
                    />
                    <label className="text-sm">Активно</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Короткое описание (до 100 символов)</label>
                  <textarea 
                    className="w-full border rounded px-3 py-2" 
                    rows={2} 
                    maxLength={100}
                    value={ticket.description} 
                    onChange={e => updateTicket(index, 'description', e.target.value)} 
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {ticket.description.length}/100 символов
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Статус */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Статус</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  id="status-active" 
                  type="radio" 
                  name="status"
                  value="active"
                  checked={form.status === 'active'} 
                  onChange={e => setForm({ ...form, status: e.target.value })} 
                />
                <label htmlFor="status-active" className="text-sm">Активно</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  id="status-draft" 
                  type="radio" 
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'} 
                  onChange={e => setForm({ ...form, status: e.target.value })} 
                />
                <label htmlFor="status-draft" className="text-sm">В черновик</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <Link href={`/admin/afisha/events${keySuffix}`} className="px-4 py-2 border rounded-md">Отмена</Link>
            <button 
              type="submit" 
              disabled={saving} 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Сохранение…' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}