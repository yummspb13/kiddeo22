'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'

interface VenueSearchBoxProps {
  citySlug: string
}

interface SearchSuggestion {
  id: string
  type: 'place' | 'category' | 'ai_suggestion'
  title: string
  description?: string
  price?: number
  image?: string
  category?: string
  rating?: number
  location?: string
  isPopular?: boolean
  href?: string
}

export default function VenueSearchBox({ citySlug }: VenueSearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)

  // Проверка монтирования для портала
  useEffect(() => {
    setMounted(true)
  }, [])

  // Функция для обновления позиции dropdown
  const updatePosition = () => {
    if (inputRef.current && searchButtonRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect()
      const buttonRect = searchButtonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      
      // Ширина от левого края input до правого края кнопки
      const containerWidth = buttonRect.right - inputRect.left
      
      // Центрируем dropdown на странице
      const centerLeft = (viewportWidth - containerWidth) / 2
      
      setPosition({
        top: inputRect.bottom + window.scrollY + 8,
        left: Math.max(16, centerLeft),
        width: containerWidth
      })
    }
  }

  // Обновляем позицию при скролле и изменении размера окна
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => updatePosition()
    const handleResize = () => updatePosition()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  // Поиск мест через API (как в SubcategorySearchBox)
  const searchVenues = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        city: citySlug,
        type: 'place' // Только места
      })

      const response = await fetch(`/api/search/suggestions?${params.toString()}`, { 
        cache: 'no-store' 
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Задержка для поиска
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchVenues(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, citySlug])

  // Обработка нажатий клавиш
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

  // Обработка клика по предложению
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.href) {
      router.push(suggestion.href)
    }
    setIsOpen(false)
    setQuery("")
  }

  // Обработка поиска
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/city/${citySlug}/cat/venues?q=${encodeURIComponent(query)}`)
    }
    setIsOpen(false)
  }

  // Обработка изменения input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length > 0)
    setSelectedIndex(-1)
    
    if (value.length > 0) {
      updatePosition()
    }
  }

  // Обработка фокуса
  const handleFocus = () => {
    if (query.length > 0) {
      setIsOpen(true)
      updatePosition()
    }
  }

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 w-full shadow-lg">
        <Search className={`w-5 h-5 mr-3 flex-shrink-0 ${isLoading ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Поиск мест..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none border-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
            }}
            className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
        <button 
          ref={searchButtonRef}
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
        >
          {isLoading ? '...' : 'Найти'}
        </button>
      </div>

      {/* Dropdown с предложениями */}
      {mounted && isOpen && suggestions.length > 0 && (
        createPortal(
          <div
            ref={suggestionsRef}
            className="fixed bg-white rounded-2xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[9999]"
            style={{ 
              position: 'fixed',
              zIndex: 9999,
              top: position.top,
              left: position.left,
              width: position.width,
              minWidth: position.width,
              transform: 'translateX(0)'
            }}
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Поиск...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`p-4 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                      : 'hover:bg-gray-50'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Изображение */}
                    {suggestion.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Заголовок */}
                      <h4 className="font-semibold text-gray-900 truncate font-unbounded">
                        {suggestion.title}
                      </h4>
                      
                      {/* Описание */}
                      {suggestion.description && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {suggestion.description}
                        </p>
                      )}
                      
                      {/* Метаинформация */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-unbounded">
                        {suggestion.location && (
                          <span className="flex items-center gap-1">
                            📍 {suggestion.location}
                          </span>
                        )}
                        {suggestion.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {suggestion.rating}
                          </span>
                        )}
                        {suggestion.price && (
                          <span className="text-green-600 font-medium">
                            от {suggestion.price}₽
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : query.length > 0 ? (
              <div className="p-4 text-center text-gray-500">
                Ничего не найдено
              </div>
            ) : null}
          </div>,
          document.body
        )
      )}
    </div>
  )
}
