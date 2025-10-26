'use client'

import { useState } from 'react'

interface MetroStation {
  name: string
  line: string
  distance: number
}

interface AddressInfoProps {
  district: string | null
  metro: MetroStation[]
  onDistrictChange: (district: string) => void
  onMetroChange: (metro: string) => void
  className?: string
  disabled?: boolean
}

export default function AddressInfo({
  district,
  metro,
  onDistrictChange,
  onMetroChange,
  className = "",
  disabled = false
}: AddressInfoProps) {
  const [districtInput, setDistrictInput] = useState(district || '')
  const [metroInput, setMetroInput] = useState('')

  // Находим ближайшее метро
  const nearestMetro = metro.length > 0 
    ? metro.sort((a, b) => a.distance - b.distance)[0]
    : null

  const handleDistrictChange = (value: string) => {
    setDistrictInput(value)
    onDistrictChange(value)
  }

  const handleMetroChange = (value: string) => {
    setMetroInput(value)
    onMetroChange(value)
  }

  const selectNearestMetro = () => {
    if (nearestMetro) {
      setMetroInput(nearestMetro.name)
      onMetroChange(nearestMetro.name)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Район города */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Район города
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={districtInput}
              onChange={(e) => handleDistrictChange(e.target.value)}
              placeholder="Введите район города"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {district && (
              <button
                type="button"
                onClick={() => {
                  setDistrictInput('')
                  onDistrictChange('')
                }}
                disabled={disabled}
                className="px-2 py-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>
          {!district && (
            <div className="text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span>ℹ️</span>
                <span>Район города будет заполнен автоматически при выборе адреса</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ближайшее метро */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ближайшее метро
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={metroInput}
              onChange={(e) => handleMetroChange(e.target.value)}
              placeholder="Введите станцию метро"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {nearestMetro && (
              <button
                type="button"
                onClick={selectNearestMetro}
                disabled={disabled}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                title={`Автоматически заполнить: ${nearestMetro.name}`}
              >
                📍 Авто
              </button>
            )}
            {metroInput && (
              <button
                type="button"
                onClick={() => {
                  setMetroInput('')
                  onMetroChange('')
                }}
                disabled={disabled}
                className="px-2 py-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>

          {/* Список ближайших станций метро */}
          {metro.length > 0 ? (
            <div className="text-xs text-gray-500">
              <div className="font-medium mb-1">Найденные станции метро:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {metro.slice(0, 3).map((station, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setMetroInput(station.name)
                      onMetroChange(station.name)
                    }}
                  >
                    <span className="font-medium">{station.name}</span>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <span className="text-xs">{station.line}</span>
                      <span className="text-xs">
                        {station.distance < 1000 
                          ? `${station.distance}м` 
                          : `${(station.distance / 1000).toFixed(1)}км`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span>ℹ️</span>
                <span>Данные о метро недоступны для бесплатного тарифа DaData</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
