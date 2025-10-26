'use client'

import { useState, useEffect } from 'react'

interface Coordinates {
  lat: number | null
  lng: number | null
}

interface MapCoordinatesProps {
  coordinates: Coordinates
  onCoordinatesChange: (coordinates: Coordinates) => void
  className?: string
  disabled?: boolean
}

export default function MapCoordinates({
  coordinates,
  onCoordinatesChange,
  className = "",
  disabled = false
}: MapCoordinatesProps) {
  const [latInput, setLatInput] = useState<string>('')
  const [lngInput, setLngInput] = useState<string>('')

  // Синхронизируем внутреннее состояние с пропсами
  useEffect(() => {
    setLatInput(coordinates.lat?.toString() || '')
    setLngInput(coordinates.lng?.toString() || '')
  }, [coordinates])

  const handleLatChange = (value: string) => {
    setLatInput(value)
    const lat = value ? parseFloat(value) : null
    if (lat !== null && !isNaN(lat)) {
      onCoordinatesChange({
        lat,
        lng: coordinates.lng
      })
    }
  }

  const handleLngChange = (value: string) => {
    setLngInput(value)
    const lng = value ? parseFloat(value) : null
    if (lng !== null && !isNaN(lng)) {
      onCoordinatesChange({
        lat: coordinates.lat,
        lng
      })
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
        onCoordinatesChange({
          lat: latitude,
          lng: longitude
        })
        setLatInput(latitude.toString())
        setLngInput(longitude.toString())
      },
      (error) => {
        console.error('Ошибка получения геолокации:', error)
        alert('Не удалось получить текущее местоположение')
      }
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Координаты на карте
        </label>
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={disabled}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          📍 Мое местоположение
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Широта (lat)
          </label>
          <input
            type="number"
            step="any"
            value={latInput}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder="55.7558"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Долгота (lng)
          </label>
          <input
            type="number"
            step="any"
            value={lngInput}
            onChange={(e) => handleLngChange(e.target.value)}
            placeholder="37.6176"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
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
