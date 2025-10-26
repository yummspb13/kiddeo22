"use client"

import { useState, useEffect, useRef } from 'react'
import { Train, ChevronDown } from 'lucide-react'

interface MetroOption {
  value: string
  label: string
  line: string
}

interface MetroAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function MetroAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Выберите станцию метро",
  className = ""
}: MetroAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<MetroOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Список станций метро Москвы и СПб
  const metroStations = [
    // Москва
    { name: "Сокольники", line: "Сокольническая линия" },
    { name: "Красносельская", line: "Сокольническая линия" },
    { name: "Комсомольская", line: "Сокольническая линия" },
    { name: "Красные Ворота", line: "Сокольническая линия" },
    { name: "Чистые пруды", line: "Сокольническая линия" },
    { name: "Лубянка", line: "Сокольническая линия" },
    { name: "Охотный ряд", line: "Сокольническая линия" },
    { name: "Библиотека им. Ленина", line: "Сокольническая линия" },
    { name: "Кропоткинская", line: "Сокольническая линия" },
    { name: "Парк культуры", line: "Сокольническая линия" },
    { name: "Фрунзенская", line: "Сокольническая линия" },
    { name: "Спортивная", line: "Сокольническая линия" },
    { name: "Воробьёвы горы", line: "Сокольническая линия" },
    { name: "Университет", line: "Сокольническая линия" },
    { name: "Проспект Вернадского", line: "Сокольническая линия" },
    { name: "Юго-Западная", line: "Сокольническая линия" },
    { name: "Тропарёво", line: "Сокольническая линия" },
    { name: "Румянцево", line: "Сокольническая линия" },
    { name: "Саларьево", line: "Сокольническая линия" },
    { name: "Филатов луг", line: "Сокольническая линия" },
    { name: "Прокшино", line: "Сокольническая линия" },
    { name: "Ольховая", line: "Сокольническая линия" },
    { name: "Коммунарка", line: "Сокольническая линия" },
    
    // СПб
    { name: "Адмиралтейская", line: "Фрунзенско-Приморская линия" },
    { name: "Садовая", line: "Фрунзенско-Приморская линия" },
    { name: "Звенигородская", line: "Фрунзенско-Приморская линия" },
    { name: "Обводный канал", line: "Фрунзенско-Приморская линия" },
    { name: "Волковская", line: "Фрунзенско-Приморская линия" },
    { name: "Бухарестская", line: "Фрунзенско-Приморская линия" },
    { name: "Международная", line: "Фрунзенско-Приморская линия" },
    { name: "Проспект Славы", line: "Фрунзенско-Приморская линия" },
    { name: "Дунайская", line: "Фрунзенско-Приморская линия" },
    { name: "Шушары", line: "Фрунзенско-Приморская линия" },
    { name: "Парк Победы", line: "Московско-Петроградская линия" },
    { name: "Электросила", line: "Московско-Петроградская линия" },
    { name: "Московские ворота", line: "Московско-Петроградская линия" },
    { name: "Фрунзенская", line: "Московско-Петроградская линия" },
    { name: "Технологический институт", line: "Московско-Петроградская линия" },
    { name: "Сенная площадь", line: "Московско-Петроградская линия" },
    { name: "Невский проспект", line: "Московско-Петроградская линия" },
    { name: "Горьковская", line: "Московско-Петроградская линия" },
    { name: "Петроградская", line: "Московско-Петроградская линия" },
    { name: "Чёрная речка", line: "Московско-Петроградская линия" },
    { name: "Пионерская", line: "Московско-Петроградская линия" },
    { name: "Удельная", line: "Московско-Петроградская линия" },
    { name: "Озерки", line: "Московско-Петроградская линия" },
    { name: "Проспект Просвещения", line: "Московско-Петроградская линия" },
    { name: "Парнас", line: "Московско-Петроградская линия" }
  ]

  useEffect(() => {
    if (searchTerm) {
      const filtered = metroStations
        .filter(station => 
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.line.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(station => ({
          value: station.name,
          label: station.name,
          line: station.line
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

  const handleSelect = (option: MetroOption) => {
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
        <Train className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Train className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.line}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && options.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            Станция метро не найдена
          </p>
        </div>
      )}
    </div>
  )
}
