"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Users,
  Sparkles,
  Mic,
  X,
  ArrowRight,
  Filter
} from "lucide-react"

interface SearchSuggestion {
  id: string
  type: 'event' | 'place' | 'category' | 'ai_suggestion'
  title: string
  description?: string
  price?: number
  image?: string
  category?: string
  rating?: number
  date?: string
  location?: string
  isPopular?: boolean
  href?: string
}

interface SmartSearchProps { selectedCity?: string }

// selectedCity is a CITY SLUG (e.g., 'moskva', 'spb')
export default function SmartSearch({ selectedCity = 'moskva' }: SmartSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // live suggestions loader
  useEffect(() => {
    const ctrl = new AbortController()
    const load = async () => {
      if (query.trim().length < 2) { setSuggestions([]); return }
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedCity)}`, { signal: ctrl.signal, cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch {}
      setIsLoading(false)
    }
    const t = setTimeout(load, 300)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, selectedCity])

  // remove old mock loader

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'ai_suggestion') {
      // Обработка AI запроса
      handleAISearch(suggestion.title)
    } else if (suggestion.href) {
      router.push(suggestion.href)
    } else if (suggestion.type === 'event') {
      // Переход к событию
      router.push(`/event/${suggestion.slug || suggestion.id}`)
    } else {
      // Переход к месту
      router.push(`/listing/${suggestion.id}`)
    }
    setIsOpen(false)
    setQuery("")
  }

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&city=${selectedCity}`)
      setIsOpen(false)
    }
  }

  const handleAISearch = (aiQuery: string) => {
    // Здесь будет интеграция с ChatGPT
    router.push(`/search?ai=${encodeURIComponent(aiQuery)}&city=${selectedCity}`)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'place':
        return <MapPin className="w-4 h-4 text-green-600" />
      case 'category':
        return <Filter className="w-4 h-4 text-purple-600" />
      case 'ai_suggestion':
        return <Sparkles className="w-4 h-4 text-orange-600" />
      default:
        return <Search className="w-4 h-4 text-gray-600" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'border-l-blue-500'
      case 'place':
        return 'border-l-green-500'
      case 'category':
        return 'border-l-purple-500'
      case 'ai_suggestion':
        return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-transparent'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto z-[1000]">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border-2 border-gray-200 focus-within:border-blue-500 transition-all duration-200">
          <div className="flex items-center px-4 py-3 text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={`Поиск мероприятий в ${selectedCity}...`}
            className="flex-1 px-2 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          
          <div className="flex items-center space-x-2 px-4">
            {query && (
              <button
                onClick={() => {
                  setQuery("")
                  setIsOpen(false)
                  inputRef.current?.focus()
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (query.length > 1 || suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-[1000] max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Поиск...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${getSuggestionColor(suggestion.type)} ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  } transition-colors`}
                >
                  <div className="flex-shrink-0">
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {suggestion.title}
                      </h3>
                      {suggestion.isPopular && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Популярно
                        </span>
                      )}
                      {suggestion.type === 'ai_suggestion' && (
                        <Sparkles className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    
                    {suggestion.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {suggestion.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-1">
                      {suggestion.category && (
                        <span className="text-xs text-gray-400">
                          {suggestion.category}
                        </span>
                      )}
                      {suggestion.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500">{suggestion.rating}</span>
                        </div>
                      )}
                      {suggestion.date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{suggestion.date}</span>
                        </div>
                      )}
                      {suggestion.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{suggestion.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {suggestion.price && (
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {suggestion.price.toLocaleString()} ₽
                        </div>
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Начните вводить запрос для поиска</p>
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {query.length === 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setQuery("Посоветуй что-то на выходные с ребенком 5 лет")}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI: Что делать с ребенком 5 лет?</span>
            </button>
            <button
              onClick={() => setQuery("Детские спектакли")}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              Детские спектакли
            </button>
            <button
              onClick={() => setQuery("Мастер-классы")}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
            >
              Мастер-классы
            </button>
            <button
              onClick={() => setQuery("Парки развлечений")}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Парки развлечений
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
