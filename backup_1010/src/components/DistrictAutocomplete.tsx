"use client"

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

interface DistrictOption {
  value: string
  label: string
}

interface DistrictAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function DistrictAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Выберите район",
  className = ""
}: DistrictAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<DistrictOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Список районов Москвы и СПб
  const districts = [
    "Центральный административный округ",
    "Северный административный округ", 
    "Северо-Восточный административный округ",
    "Восточный административный округ",
    "Юго-Восточный административный округ",
    "Южный административный округ",
    "Юго-Западный административный округ",
    "Западный административный округ",
    "Северо-Западный административный округ",
    "Зеленоградский административный округ",
    "Троицкий административный округ",
    "Новомосковский административный округ",
    "Адмиралтейский район",
    "Василеостровский район",
    "Выборгский район",
    "Калининский район",
    "Кировский район",
    "Колпинский район",
    "Красногвардейский район",
    "Красносельский район",
    "Кронштадтский район",
    "Курортный район",
    "Московский район",
    "Невский район",
    "Петроградский район",
    "Петродворцовый район",
    "Приморский район",
    "Пушкинский район",
    "Фрунзенский район",
    "Центральный район"
  ]

  useEffect(() => {
    if (searchTerm) {
      const filtered = districts
        .filter(district => 
          district.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(district => ({
          value: district,
          label: district
        }))
        .slice(0, 10)
      setOptions(filtered)
    } else {
      setOptions([])
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: DistrictOption) => {
    onChange(option.value)
    setSearchTerm(option.value)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && options.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            Район не найден
          </p>
        </div>
      )}
    </div>
  )
}
