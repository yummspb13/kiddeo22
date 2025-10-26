'use client'

import { useState } from 'react'
import AddressForm from './AddressForm'

interface AddressFormData {
  address: string
  district: string
  metro: string
  coordinates: {
    lat: number | null
    lng: number | null
  }
  postalCode: string | null
  timezone: string | null
  fiasId: string
  kladrId: string
}

export default function VenueAddressExample() {
  const [addressData, setAddressData] = useState<AddressFormData>({
    address: '',
    district: '',
    metro: '',
    coordinates: {
      lat: null,
      lng: null
    },
    postalCode: null,
    timezone: null,
    fiasId: '',
    kladrId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Отправка данных адреса:', addressData)
    alert('Данные адреса отправлены! Проверьте консоль.')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Пример формы адреса с DaData
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <AddressForm
          data={addressData}
          onChange={setAddressData}
          city="Москва" // Можно динамически менять
        />
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setAddressData({
              address: '',
              district: '',
              metro: '',
              coordinates: { lat: null, lng: null },
              postalCode: null,
              timezone: null,
              fiasId: '',
              kladrId: ''
            })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Очистить
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Сохранить адрес
          </button>
        </div>
      </form>
    </div>
  )
}
