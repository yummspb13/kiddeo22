'use client'

import { useState } from 'react'
import AddressAutocomplete from './AddressAutocomplete'
import ManualAddressInfo from './ManualAddressInfo'
import MapCoordinates from './MapCoordinates'
import { getTimezoneForCity } from '@/lib/timezone-utils'

interface AddressFormData {
  address: string
  district: string
  metro: string
  coordinates: {
    lat: number | null
    lng: number | null
  }
  timezone: string | null
  fiasId: string
  kladrId: string
}

interface AddressFormProps {
  data: AddressFormData
  onChange: (data: AddressFormData) => void
  city?: string
  className?: string
  disabled?: boolean
}

export default function AddressForm({
  data,
  onChange,
  city,
  className = "",
  disabled = false
}: AddressFormProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [metroStations, setMetroStations] = useState<Array<{
    name: string
    line: string
    distance: number
  }>>([])

  const handleAddressSelect = (addressInfo: unknown) => {
    console.log('AddressInfo received:', addressInfo)
    setIsAutoFilling(true)
    
    // Сохраняем станции метро
    setMetroStations((addressInfo as any).metro || [])
    
    // Автоматически определяем часовой пояс из города
    const cityName = (addressInfo as any).city || city || ''
    const autoTimezone = getTimezoneForCity(cityName)
    
    const newData: AddressFormData = {
      address: (addressInfo as any).fullAddress,
      district: (addressInfo as any).district || '',
      metro: (addressInfo as any).metro.length > 0 ? (addressInfo as any).metro[0].name : '',
      coordinates: (addressInfo as any).coordinates,
      timezone: (addressInfo as any).timezone || autoTimezone,
      fiasId: (addressInfo as any).fiasId,
      kladrId: (addressInfo as any).kladrId
    }
    
    console.log('New data:', newData)
    onChange(newData)
    
    // Сбрасываем флаг автозаполнения через небольшую задержку
    setTimeout(() => setIsAutoFilling(false), 1000)
  }

  const handleFieldChange = (field: keyof AddressFormData, value: unknown) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const handleCoordinatesChange = (coordinates: { lat: number | null; lng: number | null }) => {
    handleFieldChange('coordinates', coordinates)
  }

  const handleDistrictChange = (district: string) => {
    handleFieldChange('district', district)
  }

  const handleMetroChange = (metro: string) => {
    handleFieldChange('metro', metro)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Основной адрес с автодополнением */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Адрес *
        </label>
        <AddressAutocomplete
          value={data.address}
          onChange={(value) => handleFieldChange('address', value)}
          onAddressSelect={handleAddressSelect}
          placeholder="Введите адрес для автодополнения"
          city={city}
          disabled={disabled}
          className="w-full"
        />
        {isAutoFilling && (
          <div className="mt-2 text-xs text-blue-600 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
            Автоматически заполняем данные...
          </div>
        )}
      </div>

      {/* Информация об адресе (район и метро) */}
      <ManualAddressInfo
        district={data.district}
        metro={data.metro}
        onDistrictChange={handleDistrictChange}
        onMetroChange={handleMetroChange}
        city={city}
        disabled={disabled}
      />

      {/* Координаты на карте */}
      <MapCoordinates
        coordinates={data.coordinates}
        onCoordinatesChange={handleCoordinatesChange}
        disabled={disabled}
      />

      {/* Скрытые поля для внутреннего использования */}
      <div className="hidden">
        <input
          type="hidden"
          name="timezone"
          value={data.timezone || ''}
        />
        <input
          type="hidden"
          name="fiasId"
          value={data.fiasId || ''}
        />
        <input
          type="hidden"
          name="kladrId"
          value={data.kladrId || ''}
        />
      </div>


      {/* Отладочная информация (только в dev режиме) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Отладочная информация</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
