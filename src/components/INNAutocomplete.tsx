"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, CheckCircle, AlertCircle, Loader2, Building2 } from 'lucide-react'

interface CompanyData {
  inn: string
  ogrn: string
  orgnip: string // Для ИП это ОГРНИП
  name: {
    full: string
    short: string
  }
  management: {
    name: string
  }
  address: {
    full: string
  }
  status: {
    status: 'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | 'BANKRUPT'
    text: string
    color: 'green' | 'orange' | 'red' | 'gray'
  }
}

interface INNAutocompleteProps {
  onSelect: (company: CompanyData) => void
  onClear: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  value?: string
}

export default function INNAutocomplete({
  onSelect,
  onClear,
  placeholder = "Введите ИНН",
  className = "",
  disabled = false,
  value = ""
}: INNAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Синхронизируем с внешним значением
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Очистка debounce при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const searchCompany = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('')
      setSelectedCompany(null)
      return
    }

    // Проверяем длину ИНН
    const cleanQuery = searchQuery.replace(/\D/g, '')
    if (cleanQuery.length !== 10 && cleanQuery.length !== 12) {
      setError('ИНН должен содержать 10 или 12 цифр')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/dadata/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          type: cleanQuery.length === 12 ? 'INDIVIDUAL' : 'LEGAL'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Для ИП исправляем данные
          const companyData = { ...data.data }
          
          // Если это ИП и нет management.name, используем name.full
          if (cleanQuery.length === 12 && !companyData.management.name && companyData.name.full) {
            companyData.management.name = companyData.name.full
          }
          
          // Если адрес неполный, используем полный адрес
          if (!companyData.address.full && companyData.address.city) {
            companyData.address.full = companyData.address.city
          }
          
          setSelectedCompany(companyData)
          onSelect(companyData)
          setShowSuggestions(false)
        } else {
          setError('Организация не найдена')
          setSelectedCompany(null)
          onClear()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Организация не найдена')
        setSelectedCompany(null)
        onClear()
      }
    } catch (error) {
      console.error('Error searching company:', error)
      setError('Ошибка при поиске организации')
      setSelectedCompany(null)
      onClear()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setError('')
    setSelectedCompany(null)
    onClear()

    // Очищаем предыдущий debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Устанавливаем новый debounce
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        searchCompany(value)
      }
    }, 500) // 500ms задержка
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    setSelectedCompany(null)
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
      {selectedCompany && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="text-sm">
              <p className="text-green-800 font-medium">✅ Организация найдена:</p>
              <p className="text-green-700">{selectedCompany.name.short}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
