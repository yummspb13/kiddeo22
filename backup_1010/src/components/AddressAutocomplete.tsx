'use client'

import { useState, useEffect, useRef } from 'react'
import { getAddressSuggestions, getAddressDetails, extractAddressInfo, DaDataAddressSuggestion } from '@/lib/dadata'

interface AddressInfo {
  fullAddress: string
  unrestrictedAddress: string
  country: string
  region: string
  city: string
  district: string | null
  street: string | null
  house: string | null
  coordinates: {
    lat: number | null
    lng: number | null
  }
  metro: Array<{
    name: string
    line: string
    distance: number
  }>
  postalCode: string | null
  timezone: string | null
  fiasId: string
  kladrId: string
  okato: string
  oktmo: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect: (addressInfo: AddressInfo) => void
  placeholder?: string
  city?: string
  className?: string
  disabled?: boolean
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Введите адрес",
  city,
  className = "",
  disabled = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<DaDataAddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Дебаунс для запросов к API
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await getAddressSuggestions(value, { city })
        setSuggestions(results)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, city])

  // Обработка выбора адреса
  const handleAddressSelect = async (suggestion: DaDataAddressSuggestion) => {
    onChange(suggestion.value)
    setShowSuggestions(false)
    setSuggestions([])
    setLoadingDetails(true)
    
    // Получаем детальную информацию об адресе для метро и района
    try {
      const details = await getAddressDetails(suggestion.value)
      if (details) {
        const addressInfo = extractAddressInfo(details)
        onAddressSelect(addressInfo)
      } else {
        // Если не удалось получить детали, используем данные из подсказки
        const addressInfo = extractAddressInfo(suggestion)
        onAddressSelect(addressInfo)
      }
    } catch (error) {
      console.error('Error fetching address details:', error)
      // В случае ошибки используем данные из подсказки
      const addressInfo = extractAddressInfo(suggestion)
      onAddressSelect(addressInfo)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleAddressSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Клик вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        autoComplete="off"
      />
      
      {(loading || loadingDetails) && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.data.fias_id || suggestion.value}-${index}`}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleAddressSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium text-gray-900">
                {suggestion.value}
              </div>
              {suggestion.data.city && (
                <div className="text-sm text-gray-500">
                  {suggestion.data.city_with_type}
                  {suggestion.data.street && `, ${suggestion.data.street_with_type}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
