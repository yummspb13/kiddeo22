// DaData API utility for address suggestions
// API Documentation: https://dadata.ru/api/suggest/address/

const DADATA_API_KEY = '2a34a7955247b518677dae854d57ae1e479c3d34'
const DADATA_SECRET_KEY = '617585b4dec65866304fb9b70e4f4915a91f3824'
const DADATA_BASE_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'

export interface DaDataAddressSuggestion {
  value: string
  unrestricted_value: string
  data: {
    country: string
    region: string
    region_type: string
    region_type_full: string
    region_with_type: string
    area: string | null
    area_type: string | null
    area_type_full: string | null
    area_with_type: string | null
    city: string | null
    city_type: string | null
    city_type_full: string | null
    city_with_type: string | null
    city_district: string | null
    city_district_type: string | null
    city_district_type_full: string | null
    city_district_with_type: string | null
    settlement: string | null
    settlement_type: string | null
    settlement_type_full: string | null
    settlement_with_type: string | null
    street: string | null
    street_type: string | null
    street_type_full: string | null
    street_with_type: string | null
    house: string | null
    house_type: string | null
    house_type_full: string | null
    fias_id: string
    fias_level: string
    fias_actuality_state: string
    kladr_id: string
    capital_marker: string
    okato: string
    oktmo: string
    tax_office: string
    tax_office_legal: string
    timezone: string | null
    geo_lat: string
    geo_lon: string
    beltway_hit: string | null
    beltway_distance: string | null
    metro: Array<{
      name: string
      line: string
      distance: number
    }> | null
    qc_geo: string
    qc_complete: string
    qc_house: string
    qc: string
    unparsed_parts: string | null
    source: string | null
    fias_house_id: string | null
    fias_street_id: string | null
    fias_city_id: string | null
    fias_area_id: string | null
    fias_region_id: string | null
    fias_settlement_id: string | null
  }
}

export interface DaDataAddressResponse {
  suggestions: DaDataAddressSuggestion[]
}

export interface DaDataRequest {
  query: string
  count?: number
  locations?: Array<{
    country?: string
    region?: string
    city?: string
    street?: string
    house?: string
  }>
  locations_boost?: Array<{
    country?: string
    region?: string
    city?: string
    street?: string
    house?: string
  }>
  from_bound?: {
    value: string
  }
  to_bound?: {
    value: string
  }
  language?: 'ru' | 'en'
}

/**
 * Получить подсказки по адресам от DaData
 */
export async function getAddressSuggestions(
  query: string,
  options: {
    count?: number
    city?: string
    language?: 'ru' | 'en'
  } = {}
): Promise<DaDataAddressSuggestion[]> {
  try {
    const requestBody: DaDataRequest = {
      query: query.trim(),
      count: options.count || 10,
      language: options.language || 'ru',
      // Добавляем параметры для получения максимальной информации
      from_bound: { value: "country" },
      to_bound: { value: "house" }
    }

    // Если указан город, ограничиваем поиск им
    if (options.city) {
      requestBody.locations = [
        {
          city: options.city
        }
      ]
    }

    const response = await fetch(`${DADATA_BASE_URL}/suggest/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${DADATA_API_KEY}`,
        'X-Secret': DADATA_SECRET_KEY
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error(`DaData API error: ${response.status} ${response.statusText}`)
      // Пробуем без секретного ключа
      const fallbackResponse = await fetch(`${DADATA_BASE_URL}/suggest/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!fallbackResponse.ok) {
        throw new Error(`DaData API error: ${response.status} ${response.statusText}`)
      }
      
      const fallbackData: DaDataAddressResponse = await fallbackResponse.json()
      return fallbackData.suggestions || []
    }

    const data: DaDataAddressResponse = await response.json()
    return data.suggestions || []
  } catch (error) {
    console.error('Error fetching address suggestions from DaData:', error)
    return []
  }
}

/**
 * Получить детальную информацию об адресе (для получения района и метро)
 */
export async function getAddressDetails(
  address: string
): Promise<DaDataAddressSuggestion | null> {
  try {
    // Пробуем разные варианты запроса для получения максимальной информации
    const requestBody: DaDataRequest = {
      query: address,
      count: 1,
      // Добавляем параметры для получения максимальной информации
      from_bound: { value: "country" },
      to_bound: { value: "house" }
    }

    console.log('Fetching address details for:', address)

    const response = await fetch(`${DADATA_BASE_URL}/suggest/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${DADATA_API_KEY}`,
        'X-Secret': DADATA_SECRET_KEY
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error(`DaData API error: ${response.status} ${response.statusText}`)
      // Пробуем без секретного ключа
      const fallbackResponse = await fetch(`${DADATA_BASE_URL}/suggest/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!fallbackResponse.ok) {
        throw new Error(`DaData API error: ${response.status} ${response.statusText}`)
      }
      
      const fallbackData: DaDataAddressResponse = await fallbackResponse.json()
      console.log('DaData fallback response:', fallbackData)
      return fallbackData.suggestions?.[0] || null
    }

    const data: DaDataAddressResponse = await response.json()
    console.log('DaData response:', data)
    
    const suggestion = data.suggestions?.[0] || null
    if (suggestion) {
      console.log('Suggestion data:', suggestion.data)
      console.log('Metro data:', suggestion.data.metro)
      console.log('District data:', suggestion.data.city_district_with_type)
      console.log('Area data:', suggestion.data.area_with_type)
    }
    
    return suggestion
  } catch (error) {
    console.error('Error fetching address details from DaData:', error)
    return null
  }
}

/**
 * Извлечь информацию об адресе для формы
 */
export function extractAddressInfo(suggestion: DaDataAddressSuggestion) {
  const data = suggestion.data
  
  return {
    // Полный адрес
    fullAddress: suggestion.value,
    unrestrictedAddress: suggestion.unrestricted_value,
    
    // Основные части адреса
    country: data.country,
    region: data.region_with_type,
    city: data.city_with_type || data.settlement_with_type,
    district: data.city_district_with_type || data.area_with_type,
    street: data.street_with_type,
    house: data.house,
    
    // Координаты
    coordinates: {
      lat: data.geo_lat ? parseFloat(data.geo_lat) : null,
      lng: data.geo_lon ? parseFloat(data.geo_lon) : null
    },
    
    // Метро
    metro: data.metro || [],
    
    // Дополнительная информация
    postalCode: data.postal_code || null,
    timezone: data.timezone,
    
    // Коды
    fiasId: data.fias_id,
    kladrId: data.kladr_id,
    okato: data.okato,
    oktmo: data.oktmo
  }
}

/**
 * Получить ближайшее метро
 */
export function getNearestMetro(suggestion: DaDataAddressSuggestion): string | null {
  const metro = suggestion.data.metro
  if (!metro || metro.length === 0) return null
  
  // Сортируем по расстоянию и берем ближайшее
  const sortedMetro = metro.sort((a, b) => a.distance - b.distance)
  return sortedMetro[0].name
}

/**
 * Получить район города
 */
export function getCityDistrict(suggestion: DaDataAddressSuggestion): string | null {
  return suggestion.data.city_district_with_type || suggestion.data.area_with_type
}
