"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Users,
  Filter,
  Sparkles,
  ArrowLeft,
  Grid,
  List,
  SortAsc,
  Heart
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SearchResultsProps {
  searchParams: {
    q?: string
    ai?: string
    city?: string
    category?: string
    type?: string
  }
  user: User
}

type SuggestionType = 'event' | 'place' | 'blog'
interface SearchResult {
  id: string
  type: SuggestionType
  title: string
  image?: string
  location?: string
  href?: string
  // optional fields for events
  actual?: boolean
  startDateText?: string | null
  endDateText?: string | null
}

export default function SearchResults({ searchParams, user }: SearchResultsProps) {
  const router = useRouter()
  const sp = useSearchParams()
  const qParam = sp.get('q') || ''
  const cityParam = sp.get('city') || undefined
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [qLocal, setQLocal] = useState<string>(qParam)
  const [page, setPage] = useState<number>(1)
  const pageSize = 12
  const [filters, setFilters] = useState({
    type: '', // afisha | place | party | blog
    subcats: new Set<string>(),
  })
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (qParam) params.set('q', qParam)
        if (cityParam) params.set('city', cityParam)
        if (filters.type) params.set('type', filters.type)
        if (filters.subcats.size) params.set('subcats', Array.from(filters.subcats).join(','))
        params.set('limit', String(100))
        const res = await fetch(`/api/search/suggestions?${params.toString()}`, { signal: ctrl.signal, cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setResults((data.suggestions || []) as SearchResult[])
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      }
      setLoading(false)
    }
    load()
    return () => ctrl.abort()
  }, [qParam, cityParam, filters.type, filters.subcats])

  // Reset page on query/filters change
  useEffect(() => {
    setPage(1)
  }, [qParam, cityParam, filters.type, filters.subcats])

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry || !entry.isIntersecting) return
      setPage((p) => {
        const maxPage = Math.max(1, Math.ceil(results.length / pageSize))
        return p < maxPage ? p + 1 : p
      })
    }, { root: null, rootMargin: '200px', threshold: 0 })
    observer.observe(el)
    return () => {
      observer.unobserve(el)
      observer.disconnect()
    }
  }, [results.length])

  // Keep input in sync with URL query
  useEffect(() => {
    setQLocal(qParam)
  }, [qParam])

  const getQueryText = () => qParam || "Поиск"

  const getAgeRange = (ageFrom: number, ageTo: number) => {
    if (ageFrom === ageTo) {
      return `${ageFrom} лет`
    }
    return `${ageFrom}-${ageTo} лет`
  }

  const getPriceRange = (price: number) => {
    if (price < 1000) {
      return "До 1000₽"
    } else if (price < 2000) {
      return "1000-2000₽"
    } else {
      return "От 2000₽"
    }
  }

  function formatDateBadge(dateText?: string | null): string | null {
    console.log('🔍 SearchResults formatDateBadge input:', { dateText, type: typeof dateText })
    if (!dateText) return null
    try {
      const d = new Date(dateText)
      console.log('🔍 SearchResults parsed date:', { date: d, isValid: !Number.isNaN(d.getTime()) })
      if (Number.isNaN(d.getTime())) {
        console.warn('Invalid date in SearchResults:', dateText)
        return 'Дата'
      }
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const result = `${dd}.${mm}`
      console.log('🔍 SearchResults formatDateBadge result:', result)
      return result
    } catch (error) {
      console.error('Error formatting date in SearchResults:', dateText, error)
      return 'Дата'
    }
  }

  function getEventDateBadge(r: SearchResult): string | null {
    const anyR = r as any
    const sd: string | null | undefined = anyR.startDateText
    const ed: string | null | undefined = anyR.endDateText
    // Prefer startDate, fallback to endDate
    if (sd) return formatDateBadge(sd)
    if (ed) return formatDateBadge(ed)
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Поиск результатов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getQueryText()}
                </h1>
                <p className="text-gray-600 mt-1">
                  {results.length} результатов в {cityParam || 'moskva'}
                </p>
              </div>
            </div>
            {/* Right side quick search */}
            <div className="hidden md:flex items-center bg-white rounded-2xl shadow-lg border-2 border-gray-200 focus-within:border-blue-500 transition-all">
              <div className="flex items-center px-4 py-2 text-gray-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                value={qLocal}
                onChange={(e) => setQLocal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const params = new URLSearchParams()
                    if (qLocal.trim()) params.set('q', qLocal.trim())
                    if (cityParam) params.set('city', cityParam)
                    router.push(`/search?${params.toString()}`, { scroll: false })
                  }
                }}
                placeholder="Поиск..."
                className="h-12 w-[420px] md:w-[520px] lg:w-[640px] px-2 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  const params = new URLSearchParams()
                  if (qLocal.trim()) params.set('q', qLocal.trim())
                  if (cityParam) params.set('city', cityParam)
                  router.push(`/search?${params.toString()}`, { scroll: false })
                }}
                className="m-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                aria-label="Найти"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {searchParams.ai && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">AI-поиск</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({ ...prev, type: value }))
                      const params = new URLSearchParams()
                      if (qParam) params.set('q', qParam)
                      if (cityParam) params.set('city', cityParam)
                      if (value) params.set('type', value)
                      if (filters.subcats.size) params.set('subcats', Array.from(filters.subcats).join(','))
                      const url = `/search?${params.toString()}`
                      if (typeof window !== 'undefined') window.history.replaceState(null, '', url)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все</option>
                    <option value="afisha">Афиша</option>
                    <option value="place">Место</option>
                    <option value="party">Праздники</option>
                    <option value="blog">Блог</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подкатегории
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Лофты','Аниматоры','Детская еда','Сладкое','Декораторы','Фотографы','Мастер-классы','Прочий досуг','Спорт','Образование','Медицина','Лагеря','Няни'].map(name => {
                      const checked = filters.subcats.has(name)
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            const next = new Set(filters.subcats)
                            if (next.has(name)) next.delete(name)
                            else next.add(name)
                            setFilters(prev => ({ ...prev, subcats: next }))
                            const params = new URLSearchParams()
                            if (qParam) params.set('q', qParam)
                            if (cityParam) params.set('city', cityParam)
                            if (filters.type) params.set('type', filters.type)
                            if (next.size) params.set('subcats', Array.from(next).join(','))
                            const url = `/search?${params.toString()}`
                            if (typeof window !== 'undefined') window.history.replaceState(null, '', url)
                          }}
                          className={`h-10 px-3 whitespace-nowrap rounded-md text-sm border flex items-center justify-center ${checked ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} hover:border-blue-400`}
                        >
                          {checked ? '✓ ' : ''}{name}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Можно выбрать несколько вариантов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {results.length} результатов
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Сортировка:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="relevance">По релевантности</option>
                      <option value="price">По цене</option>
                      <option value="rating">По рейтингу</option>
                      <option value="date">По дате</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Results Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {results.slice((page-1)*pageSize, page*pageSize).map((r) => (
                <a
                  key={`${r.type}-${r.id}`}
                  href={r.href || (r.type === 'place' ? `/listing/${r.id}` : r.type === 'blog' ? `/blog/${r.id}` : `/event/${r.id}`)}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  <div className={`${viewMode === 'list' ? 'w-64 h-48' : 'h-48'} relative`}>
                    {r.type === 'event' && getEventDateBadge(r) && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/90 text-gray-900 shadow ring-1 ring-black/5">
                          {getEventDateBadge(r)}
                        </span>
                      </div>
                    )}
                    <img src={r.image || '/api/placeholder/300/200'} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{r.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {r.type === 'event' ? 'Мероприятие' : r.type === 'place' ? 'Место' : 'Блог'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{r.location || '—'}</span>
                      </div>
                      {r.type === 'event' && (
                        <span className={`px-2 py-1 text-xs rounded-full ${ (r as any).actual ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700' }`}>
                          {(r as any).actual ? 'Актуально' : 'Прошедшее'}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {/* No Results */}
            {results.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-gray-500 mb-6">
                  Попробуйте изменить параметры поиска или использовать другие ключевые слова
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Вернуться на главную
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
