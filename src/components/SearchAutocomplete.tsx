'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface SearchSuggestion {
  id: string
  title: string
  slug: string
  venue: string
  startDate: string
  endDate: string
  coverImage: string | null
  isPast: boolean
}

interface SearchAutocompleteProps {
  citySlug: string
  onSearch?: (query: string) => void
  initialQuery?: string
}

export default function SearchAutocomplete({ citySlug, onSearch, initialQuery = '' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Инициализируем поисковый запрос из URL при загрузке компонента
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery !== query) {
      setQuery(urlQuery || '')
    }
  }, [searchParams])

  // Задержка для поиска
  useEffect(() => {
    // Проверяем, есть ли активный поиск в URL
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      // Если есть поиск в URL, не показываем автокомплит
      setSuggestions([])
      setIsOpen(false)
      return
    }

    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&city=${citySlug}`)
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setIsOpen(data.suggestions && data.suggestions.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 500) // Увеличиваем задержку до 500мс

    return () => clearTimeout(timeoutId)
  }, [query, citySlug, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

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
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
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
    setIsOpen(false)
    setQuery('')
    setSuggestions([])
    router.push(`/event/${suggestion.slug}`)
  }

  const handleSearch = () => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        // Самостоятельная навигация
        const url = new URL(window.location.href)
        url.searchParams.set('q', query.trim())
        router.push(url.toString())
      }
      setIsOpen(false)
      setSuggestions([])
    }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    
    // Сначала сбрасываем поиск через onSearch
    onSearch('')
    
    // Затем очищаем URL параметр
    const url = new URL(window.location.href)
    url.searchParams.delete('q')
    window.history.replaceState({}, '', url.toString())
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        return 'Дата уточняется'
      }
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) {
        return 'Дата уточняется'
      }
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      })
    } catch (error) {
      return 'Дата уточняется'
    }
  }

  return (
    <div className="relative flex-1">
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Поиск событий..." 
          className="border-none outline-none bg-transparent flex-1"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0)}
        />
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        ) : query ? (
          <button
            onClick={handleClear}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              } ${suggestion.isPast ? 'opacity-60' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.coverImage && (
                <img 
                  src={suggestion.coverImage} 
                  alt={suggestion.title}
                  className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium truncate ${suggestion.isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                    {suggestion.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatDate(suggestion.startDateText)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {suggestion.venue}
                </p>
                {suggestion.isPast && (
                  <span className="text-xs text-gray-400">Завершено</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
