'use client'

import { useState } from 'react'
import { getAddressSuggestions, getAddressDetails } from '@/lib/dadata'

export default function TestDaDataPage() {
  const [query, setQuery] = useState('Москва Красная площадь')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSuggestions = async () => {
    setLoading(true)
    try {
      const results = await getAddressSuggestions(query)
      setSuggestions(results)
      console.log('Suggestions:', results)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testDetails = async () => {
    setLoading(true)
    try {
      const result = await getAddressDetails(query)
      setDetails(result)
      console.log('Details:', result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Тест DaData API</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Запрос:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={testSuggestions}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Тест подсказок
          </button>
          
          <button
            onClick={testDetails}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            Тест деталей
          </button>
        </div>
        
        {loading && <div>Загрузка...</div>}
        
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Подсказки:</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="font-medium">{suggestion.value}</div>
                  <div className="text-sm text-gray-600">
                    Метро: {suggestion.data.metro ? suggestion.data.metro.length : 0} станций
                  </div>
                  <div className="text-sm text-gray-600">
                    Район: {suggestion.data.city_district_with_type || 'Нет данных'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {details && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Детали:</h3>
            <div className="p-3 border rounded-md">
              <div className="font-medium">{details.value}</div>
              <div className="text-sm text-gray-600 mt-2">
                <div>Метро: {details.data.metro ? details.data.metro.length : 0} станций</div>
                <div>Район: {details.data.city_district_with_type || 'Нет данных'}</div>
                <div>Координаты: {details.data.geo_lat}, {details.data.geo_lon}</div>
              </div>
              {details.data.metro && details.data.metro.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Станции метро:</div>
                  <ul className="text-sm text-gray-600">
                    {details.data.metro.map((station: any, index: number) => (
                      <li key={index}>
                        {station.name} ({station.line}) - {station.distance}м
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
