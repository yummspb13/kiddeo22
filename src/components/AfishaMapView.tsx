'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    __kiddeoMapInstance?: unknown
  }
}
import { loadYandexMaps, isYandexMapsReady } from '@/lib/yandex-maps'

interface AfishaEvent {
  id: number
  title: string
  slug: string
  description: string
  venue: string
  organizer: string
  startDate: string
  endDate: string | null
  coordinates: string | null
  coverImage: string | null
  gallery: string | null
  tickets: string | null
  ageFrom: number | null
  ageGroups: string | null
  city: string
  category: string
}

interface AfishaMapViewProps {
  events: AfishaEvent[]
  cityCenter: { lat: number; lng: number }
  cityName: string
  onError?: (error: string) => void
}

interface EventMarker {
  id: number
  coordinates: [number, number]
  event: AfishaEvent
}

export default function AfishaMapView({ events, cityCenter, cityName, onError }: AfishaMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const openPlacemarkRef = useRef<any>(null)
  const mapInitializedRef = useRef<boolean>(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const scriptListenerAttachedRef = useRef<boolean>(false)

  // Парсим координаты событий
  const eventMarkers: EventMarker[] = useMemo(() => {
    return events
      .filter(event => event.coordinates)
      .map(event => {
        try {
          // Поддержка двух форматов: JSON {lat, lng} и строка "lat, lng"
          let lat: number | undefined
          let lng: number | undefined

          if (!event.coordinates) return null
          const raw = event.coordinates.trim()
          
          if (raw.startsWith('{') || raw.startsWith('[')) {
            const coords = JSON.parse(raw)
            if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
              lat = coords.lat
              lng = coords.lng
            }
          } else {
            const parts = raw.split(',').map(p => Number(p.trim()))
            if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
              lat = parts[0]
              lng = parts[1]
            }
          }

          if (typeof lat === 'number' && typeof lng === 'number') {
            return {
              id: event.id,
              coordinates: [lat, lng],
              event
            }
          }
        } catch (e) {
          console.warn('Invalid coordinates for event:', event.id, event.coordinates)
        }
        return null
      })
      .filter((marker): marker is EventMarker => marker !== null)
  }, [events])

  // Загружаем Яндекс.Карты
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current === null) return

    setLoadingStartTime(Date.now())

    // Таймаут для загрузки карты
    const timeout = setTimeout(() => {
      const errorMsg = 'Карта не загрузилась. Возможно, проблема с сетью.'
      setMapError(errorMsg)
      onError?.(errorMsg)
    }, 5000) // 5 секунд

    const initMap = () => {
      if (!window.ymaps || !mapRef.current || map || mapInitializedRef.current) return
      if (mapRef.current.dataset && mapRef.current.dataset.initialized === '1') return

      // Дожидаемся готовности API
      (window.ymaps as any).ready(() => {
        if (!mapRef.current || map) return

        // Если по каким-то причинам осталась старая карта, уничтожим её (защита от дублей)
        try {
          // @ts-ignore
          if (window.__kiddeoMapInstance && typeof window.__kiddeoMapInstance.destroy === 'function') {
            // @ts-ignore
            window.__kiddeoMapInstance.destroy()
            // @ts-ignore
            window.__kiddeoMapInstance = null
          }
        } catch {}

        const ymap = new (window.ymaps as any).Map(mapRef.current, {
          center: [cityCenter.lat, cityCenter.lng],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        })

        setMap(ymap)
        setIsMapLoaded(true)
        setMapError(null)
        setLoadingStartTime(null)
        mapInitializedRef.current = true
        clearTimeout(timeout)
        try { if (mapRef.current) mapRef.current.dataset.initialized = '1' } catch {}
        try { /* @ts-ignore */ window.__kiddeoMapInstance = ymap } catch {}

        // Обновляем размеры контейнера карты
        try { ymap.container.fitToViewport() } catch {}

        // Обработчик ресайза окна
        const onResize = () => {
          try { ymap.container.fitToViewport() } catch {}
        }
        window.addEventListener('resize', onResize)

        // Закрытие открытого баллуна по клику по карте (однократно)
        ymap.events.add('click', () => {
          try {
            if (openPlacemarkRef.current) {
              openPlacemarkRef.current.balloon.close()
              openPlacemarkRef.current = null
            }
          } catch {}
        })

        // Очистка обработчика при разрушении
        ymap.events.add('destroy', () => {
          window.removeEventListener('resize', onResize)
        })
      })
    }

    const loadMaps = async () => {
      try {
        await loadYandexMaps()
        initMap()
      } catch (error) {
        console.error('Failed to load Yandex Maps:', error)
        setMapError('Ошибка загрузки Яндекс.Карт. Проверьте API ключ.')
      }
    }

    loadMaps()

    return () => {
      clearTimeout(timeout)
      try {
        if (map) {
          (map as any).destroy()
          setMap(null)
        }
        // @ts-ignore
        if (window.__kiddeoMapInstance) {
          try { /* @ts-ignore */ (window.__kiddeoMapInstance as any).destroy() } catch {}
          try { /* @ts-ignore */ window.__kiddeoMapInstance = null } catch {}
        }
      } finally {
        mapInitializedRef.current = false
        if (mapRef.current) {
          try {
            mapRef.current.innerHTML = ''
            mapRef.current.removeAttribute('data-initialized')
          } catch {}
        }
      }
    }
  }, [cityCenter.lat, cityCenter.lng]) // Убираем eventMarkers из зависимостей

  // Обновляем маркеры при изменении событий
  useEffect(() => {
    console.log('🔄 Updating markers...', { map: !!map, ymaps: !!window.ymaps, isMapLoaded, eventMarkers: eventMarkers.length })
    
    if (!map || !window.ymaps || !isMapLoaded) {
      console.log('❌ Cannot update markers:', { map: !!map, ymaps: !!window.ymaps, isMapLoaded })
      return
    }

    // Вставляем стили анимации один раз
    const styleId = 'kr-map-marker-anim'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes krDrop {
          0% { transform: translateY(-24px) scale(0.9); opacity: 0; }
          70% { transform: translateY(2px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .kr-marker-pin { width: 40px; height: 56px; will-change: transform, opacity; animation: krDrop 420ms cubic-bezier(.2,.8,.2,1) forwards; }
        .kr-marker-pin .kr-marker-img { width: 40px; height: 56px; display: block; }
        /* Отключаем системные хинты Яндекс-карт (мешают при длительном наведении) */
        .ymaps-2-1-79-hint { display: none !important; }
      `
      document.head.appendChild(style)
    }

    // Шаблон HTML-маркера больше не используем для стабильности событий (и Safari, и Chrome — image)
    const PinLayout = null as any
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua)

    // Очищаем старые объекты
    map.geoObjects.removeAll()

    // Коллекция объектов (без кластеризатора для стабильности событий)
    const collection = new (window.ymaps as any).GeoObjectCollection({}, {
      zIndex: 7000,
      zIndexHover: 8000
    })

    // Создаем новые маркеры
    console.log('📍 Creating markers for events:', eventMarkers.length)
    const newMarkers = eventMarkers.map((markerData, index) => {
      console.log(`📍 Creating marker ${index + 1}:`, markerData.event.title, markerData.coordinates)
      const commonImageOptions = {
        iconLayout: 'default#image',
        iconImageHref: '/icons/marker-pin.svg',
        iconImageSize: [40, 56] as [number, number],
        iconImageOffset: [-20, -56] as [number, number],
        hasBalloon: true,
        openBalloonOnClick: true,
        zIndex: 7000,
        zIndexHover: 8000,
        cursor: 'pointer' as const
      }

      const markerOptions = isSafari
        ? {
            // Safari: возвращаем системный пресет для гарантированной видимости
            preset: 'islands#redIcon',
            hasBalloon: true,
            openBalloonOnClick: true,
            zIndex: 7000,
            zIndexHover: 8000,
            cursor: 'pointer' as const
          }
        : {
            ...commonImageOptions,
            iconShape: {
              type: 'Circle',
              coordinates: [0, -28],
              radius: 22
            }
          }

      const marker = new (window.ymaps as any).Placemark(
        markerData.coordinates,
        {
          balloonContentHeader: '',
          balloonContentBody: `
            <div style="font-family:var(--font-unbounded),ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;width:380px">
              <div style="display:flex;gap:12px;align-items:center;height:180px">
                <a href="/event/${markerData.event.slug || markerData.event.id}" style="display:block;width:140px;height:160px;border-radius:10px;overflow:hidden;background:#f3f4f6;flex-shrink:0;position:relative">
                  ${(() => {
                    const e = markerData.event as any
                    let img = e.coverImage
                    if (!img && e.gallery) {
                      try { const g = JSON.parse(e.gallery); if (Array.isArray(g) && g.length) img = g[0] } catch {}
                    }
                    return img ? `<img src="${img}" alt="${e.title}" style="width:100%;height:100%;object-fit:cover"/>` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af">📍</div>'
                  })()}
                  <!-- Категория на фотографии -->
                  <div style="position:absolute;bottom:0;left:0;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;font-size:10px;font-weight:600;border-radius:0 6px 0 0;text-transform:uppercase;letter-spacing:0.5px">
                    ${markerData.event.afishaCategory?.name || 'Событие'}
                  </div>
                </a>
                <div style="min-width:0;flex:1;display:flex;flex-direction:column;height:160px">
                  <div style="flex:1">
                    <div style="font-weight:600;color:#111827;margin-bottom:4px;line-height:1.2;font-size:14px">${markerData.event.title}</div>
                  <div style="color:#6b7280;font-size:12px;margin-bottom:6px">${markerData.event.venue ?? ''}</div>
                  <div style="color:#374151;font-size:12px">
                    ${(() => {
                      try {
                        const startDate = new Date(markerData.event.startDate)
                        if (Number.isNaN(startDate.getTime())) return 'Дата уточняется'
                        return startDate.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'})
                      } catch (error) {
                        return 'Дата уточняется'
                      }
                    })()}
                    • ${(() => {
                      try {
                        const startDate = new Date(markerData.event.startDate)
                        if (Number.isNaN(startDate.getTime())) return 'Время уточняется'
                        return startDate.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})
                      } catch (error) {
                        return 'Время уточняется'
                      }
                    })()}
                    ${markerData.event.endDate ? ` — ${(() => {
                      try {
                        const endDate = new Date(markerData.event.endDate)
                        if (Number.isNaN(endDate.getTime())) return 'Время уточняется'
                        return endDate.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})
                      } catch (error) {
                        return 'Время уточняется'
                      }
                    })()}` : ''}
                  </div>
                  </div>
                  <!-- Блок с ценой и кнопкой прижат к низу -->
                  <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid #e5e7eb;gap:8px">
                    <div style="font-weight:600;color:#111827;font-size:13px;white-space:nowrap;flex-shrink:0">${(() => {
                      const t = markerData.event.tickets
                      if (!t) return 'Бесплатно'
                      try { const arr = JSON.parse(t); if (Array.isArray(arr) && arr.length && arr[0].price>0) return `от ${arr[0].price} ₽` } catch {}
                      return 'Бесплатно'
                    })()}</div>
                    <a href="/event/${markerData.event.slug || markerData.event.id}" style="background:#000;color:#fff;border-radius:8px;padding:6px 10px;font-weight:600;font-size:11px;text-decoration:none;transition:background-color 0.2s;white-space:nowrap;flex-shrink:0" onmouseover="this.style.backgroundColor='#374151'" onmouseout="this.style.backgroundColor='#000'">Посмотреть</a>
                  </div>
                </div>
              </div>
            </div>
          `,
          hideIconOnBalloonOpen: false,
          hintContent: markerData.event.title
        },
        markerOptions
      )

      // Передадим задержку в свойства
      marker.properties.set('delay', 60 + (index % 10) * 20)

      // Обработчики событий маркера
      const openBalloon = () => {
        try {
          if (openPlacemarkRef.current && openPlacemarkRef.current !== marker) {
            openPlacemarkRef.current.balloon.close()
          }
          if (marker.balloon && typeof marker.balloon.isOpen === 'function' && marker.balloon.isOpen()) {
            return
          }
          marker.balloon.open()
          openPlacemarkRef.current = marker
        } catch {}
      }

      marker.events.add('mouseenter', openBalloon)
      // Chrome: иногда игнорит hover у кастомного layout — дублируем на mousedown
      marker.events.add('mousedown', openBalloon)
      marker.events.add('click', openBalloon)
      marker.events.add('mouseenter', () => marker.options.set('zIndex', 9000))
      marker.events.add('mouseleave', () => marker.options.set('zIndex', 7000))
      marker.events.add('balloonopen', () => { openPlacemarkRef.current = marker })
      marker.events.add('balloonclose', () => {
        if (openPlacemarkRef.current === marker) {
          openPlacemarkRef.current = null
        }
      })

      return marker
    })

    // Добавляем коллекцию на карту сразу
    console.log('🗺️ Adding collection to map...')
    map.geoObjects.add(collection)
    console.log('✅ Collection added to map')

    // CSS-анимация падения для image-маркеров: добавляем класс на элемент иконки после добавления
    // Плавная, кроссбраузерная, без HTML-лейаута
    const addWithDrop = (m: unknown, idx: number) => {
      const delay = 60 + (idx % 10) * 60
      console.log(`⏰ Adding marker ${idx + 1} with delay ${delay}ms`)
      setTimeout(() => {
        try {
          console.log(`📍 Adding marker ${idx + 1} to collection...`)
          collection.add(m)
          console.log(`✅ Marker ${idx + 1} added to collection`)
          // Пытаемся найти DOM-элемент иконки и добавить класс анимации
          const el = (m as any).getOverlay && (m as any).getOverlay()?.getData()?.icon?.getElement?.()
          if (el) {
            el.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1), opacity 420ms ease-out'
            el.style.transform = 'translateY(-24px) scale(0.9)'
            el.style.opacity = '0'
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                el.style.transform = 'translateY(0) scale(1)'
                el.style.opacity = '1'
              })
            })
          }
        } catch {}
      }, delay)
    }

    console.log('🚀 Starting to add markers to collection...')
    newMarkers.forEach(addWithDrop)
    console.log('✅ All markers scheduled for addition')
  }, [eventMarkers, isMapLoaded]) // Убираем map из зависимостей, добавляем isMapLoaded

  // Форматирование даты и времени
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) {
        console.warn('Invalid date in AfishaMapView formatDate:', dateString)
        return 'Дата не указана'
      }
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date in AfishaMapView:', dateString, error)
      return 'Дата не указана'
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) {
        console.warn('Invalid date in AfishaMapView formatTime:', dateString)
        return 'Время не указано'
      }
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting time in AfishaMapView:', dateString, error)
      return 'Время не указано'
    }
  }

  // Парсинг возрастных групп
  const getAgeGroups = (ageGroups: string | null, ageFrom: number | null) => {
    if (ageGroups) {
      try {
        const parsed = JSON.parse(ageGroups)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.join(', ')
        }
      } catch (e) {
        console.warn('Invalid ageGroups JSON:', ageGroups)
      }
    }
    if (ageFrom !== null) {
      return `${ageFrom}+ лет`
    }
    return ''
  }

  // Получение цены
  const getPriceText = (tickets: string | null) => {
    if (!tickets) return 'Цена не указана'
    
    try {
      const parsedTickets = JSON.parse(tickets)
      if (Array.isArray(parsedTickets) && parsedTickets.length > 0) {
        const firstTicket = parsedTickets[0]
        if (firstTicket.price && firstTicket.price > 0) {
          return `${firstTicket.price} ₽`
        }
      }
    } catch (e) {
      console.warn('Invalid tickets JSON:', tickets)
    }
    
    return 'Бесплатно'
  }

  return (
    <div className="relative overflow-hidden">
      {/* Карта */}
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {!isMapLoaded && !mapError && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Загрузка карты...</div>
            <div className="text-xs text-gray-500 mt-2">
              Событий с координатами: {eventMarkers.length}
            </div>
            {loadingStartTime && (
              <div className="text-xs text-gray-400 mt-1">
                Загружается уже {Math.floor((Date.now() - loadingStartTime) / 1000)} сек
              </div>
            )}
          </div>
        )}
        {mapError && (
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <div className="text-sm text-red-600 mb-2">{mapError}</div>
            <div className="text-xs text-gray-500 mb-4">
              Событий с координатами: {eventMarkers.length}
            </div>
            {/* Статическая карта с маркерами */}
            <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg mx-auto">
              <div className="text-sm font-medium mb-2">События на карте:</div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {eventMarkers.map(marker => (
                  <div key={marker.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {(() => {
                        const e = marker.event as any
                        let img = e.coverImage
                        if (!img && e.gallery) {
                          try { const g = JSON.parse(e.gallery); if (Array.isArray(g) && g.length) img = g[0] } catch {}
                        }
                        return img ? (
                          <img src={img} alt={e.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📍</div>
                        )
                      })()}
                      {/* Категория на фотографии */}
                      <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white px-1 py-0.5 text-xs font-semibold rounded-tr">
                        {marker.event.afishaCategory?.name || 'Событие'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col h-28">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 line-clamp-2">{marker.event.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                        {marker.event.venue && <div>📍 {marker.event.venue}</div>}
                        <div>📅 ${(() => {
                          try {
                            const date = new Date(marker.event.startDate)
                            if (Number.isNaN(date.getTime())) return 'Дата уточняется'
                            return date.toLocaleDateString('ru-RU')
                          } catch (error) {
                            return 'Дата уточняется'
                          }
                        })()}</div>
                        <div>🕐 ${(() => {
                          try {
                            const date = new Date(marker.event.startDate)
                            if (Number.isNaN(date.getTime())) return 'Время уточняется'
                            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                          } catch (error) {
                            return 'Время уточняется'
                          }
                        })()}</div>
                      </div>
                      </div>
                      {/* Блок с ценой и кнопкой прижат к низу */}
                      <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-200 gap-2">
                        <div className="font-semibold text-xs text-gray-900 whitespace-nowrap flex-shrink-0">
                          {(() => {
                            const t = marker.event.tickets
                            if (!t) return 'Бесплатно'
                            try { const arr = JSON.parse(t); if (Array.isArray(arr) && arr.length && arr[0].price>0) return `от ${arr[0].price} ₽` } catch {}
                            return 'Бесплатно'
                          })()}
                        </div>
                      <a 
                        href={`/event/${marker.event.slug || marker.event.id}`}
                          className="bg-black text-white text-xs px-2 py-1 rounded-md hover:bg-gray-800 transition-colors font-semibold whitespace-nowrap flex-shrink-0"
                      >
                          Посмотреть
                      </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Информация о событиях */}
      <div className="mt-4 text-sm text-gray-600">
        Найдено событий на карте: {eventMarkers.length} из {events.length}
        {eventMarkers.length < events.length && (
          <span className="text-orange-600 ml-1">
            (некоторые события не имеют координат)
          </span>
        )}
      </div>
    </div>
  )
}
