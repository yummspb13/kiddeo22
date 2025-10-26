'use client'

import { useState, useEffect } from 'react'

interface Coordinates {
  lat: number | null
  lng: number | null
}

interface CoordinatesInputProps {
  coordinates: Coordinates
  onCoordinatesChange: (coordinates: Coordinates) => void
  className?: string
  disabled?: boolean
}

export default function CoordinatesInput({
  coordinates,
  onCoordinatesChange,
  className = "",
  disabled = false
}: CoordinatesInputProps) {
  const [coordinatesInput, setCoordinatesInput] = useState<string>('')

  // Синхронизируем внутреннее состояние с пропсами
  useEffect(() => {
    if (coordinates.lat && coordinates.lng) {
      setCoordinatesInput(`${coordinates.lat}, ${coordinates.lng}`)
    } else {
      setCoordinatesInput('')
    }
  }, [coordinates])

  const handleCoordinatesChange = (value: string) => {
    setCoordinatesInput(value)
    
    // Парсим координаты из строки формата "lat, lng"
    const parts = value.split(',').map(part => part.trim())
    
    if (parts.length === 2) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      
      if (!isNaN(lat) && !isNaN(lng)) {
        onCoordinatesChange({ lat, lng })
      } else {
        onCoordinatesChange({ lat: null, lng: null })
      }
    } else if (value === '') {
      onCoordinatesChange({ lat: null, lng: null })
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const coordsString = `${latitude}, ${longitude}`
        setCoordinatesInput(coordsString)
        onCoordinatesChange({
          lat: latitude,
          lng: longitude
        })
      },
      (error) => {
        console.error('Ошибка получения геолокации:', error)
        alert('Не удалось получить текущее местоположение')
      }
    )
  }

  const handleClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleCoordinatesChange(text)
    } catch (error) {
      console.error('Ошибка чтения из буфера обмена:', error)
      alert('Не удалось прочитать данные из буфера обмена')
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Координаты места
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            📍 Мое местоположение
          </button>
          <button
            type="button"
            onClick={handleClipboard}
            disabled={disabled}
            className="text-xs text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            📋 Из буфера
          </button>
        </div>
      </div>
      
      <div>
        <input
          type="text"
          value={coordinatesInput}
          onChange={(e) => handleCoordinatesChange(e.target.value)}
          placeholder="59.887372, 30.268123"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Формат: широта, долгота (например: 59.887372, 30.268123)
        </p>
      </div>
      
      {coordinates.lat && coordinates.lng && (
        <div className="text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span>
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </span>
            <a
              href={`https://yandex.ru/maps/?pt=${coordinates.lng},${coordinates.lat}&z=16&l=map`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Открыть на карте
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
