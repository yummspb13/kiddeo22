'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { MapPin, Star, Heart } from 'lucide-react'
import Link from 'next/link'

interface Venue {
  id: number
  name: string
  slug: string
  address: string
  coverImage?: string
  lat?: number
  lng?: number
  priceFrom?: number
  priceTo?: number
  tariff: string
  metro?: string
  rating?: number
  reviewCount?: number
}

interface VenueMapViewProps {
  venues: Venue[]
  cityCenter: { lat: number; lng: number }
  cityName: string
  citySlug: string
}

export default function VenueMapView({ venues, cityCenter, cityName }: VenueMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // Фильтруем места с координатами
  const venuesWithCoords = useMemo(() => 
    venues.filter(venue => venue.lat && venue.lng), 
    [venues]
  )

  useEffect(() => {
    console.log('🗺️ Map useEffect:', { 
      hasMapRef: !!mapRef.current, 
      venuesCount: venuesWithCoords.length,
      venues: venues.length
    })
    
    if (!mapRef.current) {
      console.log('❌ No map ref')
      setIsLoading(false)
      return
    }
    
    if (venuesWithCoords.length === 0) {
      console.log('❌ No venues with coordinates')
      setIsLoading(false)
      return
    }

    const initMap = async () => {
      try {
        // Проверяем, загружена ли Yandex Maps API
        if (!window.ymaps) {
          throw new Error('Yandex Maps API не загружена')
        }

        // Создаем карту
        const yandexMap = new window.ymaps.Map(mapRef.current, {
          center: [cityCenter.lat, cityCenter.lng],
          zoom: 11,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        })

        setMap(yandexMap)

        // Добавляем маркеры для каждого места
        venuesWithCoords.forEach((venue, index) => {
          const marker = new window.ymaps.Placemark(
            [venue.lat!, venue.lng!],
            {
              balloonContentHeader: '',
              balloonContentBody: `
                <div style="font-family:var(--font-unbounded),ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;width:380px">
                  <div style="display:flex;gap:12px;align-items:center;height:180px">
                    <a href="/city/${cityName}/venue/${venue.slug}" style="display:block;width:140px;height:160px;border-radius:10px;overflow:hidden;background:#f3f4f6;flex-shrink:0;position:relative">
                      ${venue.coverImage ? 
                        `<img src="${venue.coverImage}" alt="${venue.name}" style="width:100%;height:100%;object-fit:cover"/>` : 
                        '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af">🏢</div>'
                      }
                      <!-- Категория на фотографии -->
                      <div style="position:absolute;bottom:0;left:0;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;font-size:10px;font-weight:600;border-radius:0 6px 0 0;text-transform:uppercase;letter-spacing:0.5px">
                        ${venue.tariff === 'FREE' ? 'Бесплатно' : 'Платно'}
                      </div>
                    </a>
                    <div style="min-width:0;flex:1;display:flex;flex-direction:column;height:160px">
                      <div style="flex:1">
                        <div style="font-weight:600;color:#111827;margin-bottom:4px;line-height:1.2;font-size:14px">${venue.name}</div>
                        <div style="color:#6b7280;font-size:12px;margin-bottom:6px">${venue.address}</div>
                        <div style="color:#374151;font-size:12px">
                          ${venue.metro ? `📍 ${venue.metro}` : ''}
                        </div>
                        ${venue.rating ? `
                          <div style="display:flex;align-items:center;gap:4px;margin-top:4px">
                            <span style="color:#fbbf24">⭐</span>
                            <span style="color:#374151;font-size:12px">${venue.rating.toFixed(1)} (${venue.reviewCount || 0})</span>
                          </div>
                        ` : ''}
                      </div>
                      <div style="margin-top:8px">
                        <a href="/city/${cityName}/venue/${venue.slug}" style="display:inline-block;background:#8b5cf6;color:white;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;transition:background 0.2s">
                          Подробнее
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `,
              balloonContentFooter: ''
            },
            {
              iconLayout: 'default#image',
              iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                </svg>
              `),
              iconImageSize: [32, 32],
              iconImageOffset: [-16, -16],
              balloonOffset: [0, -10]
            }
          )

          yandexMap.geoObjects.add(marker)
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Ошибка инициализации карты:', err)
        setError('Не удалось загрузить карту')
        setIsLoading(false)
      }
    }

    initMap()
  }, [venuesWithCoords, cityCenter.lat, cityCenter.lng, cityName])

  if (error) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    )
  }

  if (venuesWithCoords.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Нет мест с координатами для отображения на карте</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
