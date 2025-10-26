"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, CheckCircle, AlertCircle, Loader2, Building2 } from 'lucide-react'

interface OrganizationData {
  name: {
    full: string
    short: string
    full_without_opf: string
    short_without_opf: string
  }
  inn: string
  kpp: string
  ogrn: string
  address: {
    full: string
    postal_code: string
    region: string
    city: string
    street: string
    house: string
    flat: string
  }
  management: {
    name: string
    post: string
    disqualified: boolean
  }
  status: {
    status: 'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | 'BANKRUPT' | 'UNKNOWN'
    text: string
    color: 'green' | 'orange' | 'red' | 'gray'
    description: string
  }
  type: string
  registration_date: string | null
  phones: string[]
  emails: string[]
  website: string
}

interface OrganizationAutocompleteProps {
  onSelect: (organization: OrganizationData) => void
  onClear: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function OrganizationAutocomplete({
  onSelect,
  onClear,
  placeholder = "Введите ИНН или ОГРН",
  className = "",
  disabled = false
}: OrganizationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationData | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Очистка debounce при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const searchOrganization = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('')
      setSelectedOrganization(null)
      return
    }

    // Определяем тип поиска по длине
    const cleanQuery = searchQuery.replace(/\D/g, '')
    let searchType = 'INN'
    
    if (cleanQuery.length === 13) {
      searchType = 'OGRN'
    } else if (cleanQuery.length !== 10 && cleanQuery.length !== 12) {
      setError('ИНН должен содержать 10 или 12 цифр, ОГРН - 13 цифр')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/dadata/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedOrganization(data.organization)
        onSelect(data.organization)
        setShowSuggestions(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Организация не найдена')
        setSelectedOrganization(null)
        onClear()
      }
    } catch (error) {
      console.error('Error searching organization:', error)
      setError('Ошибка при поиске организации')
      setSelectedOrganization(null)
      onClear()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setError('')
    setSelectedOrganization(null)
    onClear()

    // Очищаем предыдущий debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Устанавливаем новый debounce
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        searchOrganization(value)
      }
    }, 500) // 500ms задержка
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    setSelectedOrganization(null)
    setShowSuggestions(false)
    onClear()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-100'
      case 'orange':
        return 'text-orange-600 bg-orange-100'
      case 'red':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Поле ввода */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        
        {query && !loading && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {/* Результат поиска */}
      {selectedOrganization && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                {selectedOrganization.name.short}
              </h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrganization.status.color)}`}>
              {selectedOrganization.status.text}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Полное название:</span> {selectedOrganization.name.full}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-medium">ИНН:</span> {selectedOrganization.inn}
              </div>
              {selectedOrganization.kpp && (
                <div>
                  <span className="font-medium">КПП:</span> {selectedOrganization.kpp}
                </div>
              )}
              <div>
                <span className="font-medium">ОГРН:</span> {selectedOrganization.ogrn}
              </div>
              <div>
                <span className="font-medium">Тип:</span> {selectedOrganization.type}
              </div>
            </div>

            {selectedOrganization.address.full && (
              <div>
                <span className="font-medium">Адрес:</span> {selectedOrganization.address.full}
              </div>
            )}

            {selectedOrganization.management.name && (
              <div>
                <span className="font-medium">Руководитель:</span> {selectedOrganization.management.name}
                {selectedOrganization.management.post && ` (${selectedOrganization.management.post})`}
              </div>
            )}

            {selectedOrganization.registration_date && (
              <div>
                <span className="font-medium">Дата регистрации:</span> {new Date(selectedOrganization.registration_date).toLocaleDateString('ru-RU')}
              </div>
            )}

            {selectedOrganization.phones.length > 0 && (
              <div>
                <span className="font-medium">Телефоны:</span> {selectedOrganization.phones.join(', ')}
              </div>
            )}

            {selectedOrganization.emails.length > 0 && (
              <div>
                <span className="font-medium">Email:</span> {selectedOrganization.emails.join(', ')}
              </div>
            )}

            {selectedOrganization.website && (
              <div>
                <span className="font-medium">Сайт:</span> {selectedOrganization.website}
              </div>
            )}
          </div>

          {/* Предупреждение о статусе */}
          {selectedOrganization.status.status !== 'ACTIVE' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <div className="text-sm text-red-800">
                  <strong>Внимание:</strong> {selectedOrganization.status.description}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleClear}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Выбрать другую организацию
          </button>
        </div>
      )}
    </div>
  )
}
