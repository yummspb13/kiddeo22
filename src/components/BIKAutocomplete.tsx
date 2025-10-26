"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react'

interface BankData {
  name: string
  shortName: string
  fullName: string
  bik: string
  correspondentAccount: string
  address: string
  swift: string
  okpo: string
  phone: string
  rkc: string
}

interface BIKAutocompleteProps {
  onSelect: (bank: BankData) => void
  onClear: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  value?: string
}

export default function BIKAutocomplete({
  onSelect,
  onClear,
  placeholder = "Введите БИК",
  className = "",
  disabled = false,
  value = ""
}: BIKAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedBank, setSelectedBank] = useState<BankData | null>(null)
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

  const searchBank = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('')
      setSelectedBank(null)
      return
    }

    // Проверяем длину БИК
    const cleanQuery = searchQuery.replace(/\D/g, '')
    if (cleanQuery.length !== 9) {
      setError('БИК должен содержать 9 цифр')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/dadata/bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bik: searchQuery
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          setSelectedBank(data.data)
          onSelect(data.data)
          setShowSuggestions(false)
        } else {
          setError('Банк не найден')
          setSelectedBank(null)
          onClear()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Банк не найден')
        setSelectedBank(null)
        onClear()
      }
    } catch (error) {
      console.error('Error searching bank:', error)
      setError('Ошибка при поиске банка')
      setSelectedBank(null)
      onClear()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setError('')
    setSelectedBank(null)
    onClear()

    // Очищаем предыдущий debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Устанавливаем новый debounce
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        searchBank(value)
      }
    }, 500) // 500ms задержка
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    setSelectedBank(null)
    setShowSuggestions(false)
    onClear()
    if (inputRef.current) {
      inputRef.current.focus()
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
      {selectedBank && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="text-sm">
              <p className="text-green-800 font-medium">✅ Банк найден:</p>
              <p className="text-green-700">{selectedBank.fullName || selectedBank.name}</p>
              {selectedBank.correspondentAccount && (
                <p className="text-green-600 text-xs mt-1">
                  Корр. счет: {selectedBank.correspondentAccount}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
