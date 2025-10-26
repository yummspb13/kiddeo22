'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    ymaps: unknown
  }
}

interface SimpleMapVisualProps {
  events: unknown[]
  cityCenter: { lat: number; lng: number }
  cityName: string
}

export default function SimpleMapVisual({ events, cityCenter, cityName }: SimpleMapVisualProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState('Инициализация...')
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null)

  // Callback ref для надежного получения DOM элемента
  const mapRefCallback = (node: HTMLDivElement | null) => {
    console.log('🔗 Map ref callback called with:', node)
    if (node) {
      mapRef.current = node
      setMapElement(node)
      console.log('✅ Map element set via callback ref')
    }
  }

  // Функция принудительного создания DOM элемента
  const forceCreateDOM = () => {
    console.log('🔧 Force creating DOM element...')
    const parentContainer = document.querySelector('.w-full.h-\\[600px\\].rounded-lg.overflow-hidden')
    if (parentContainer) {
      parentContainer.innerHTML = ''
      const newElement = document.createElement('div')
      newElement.className = 'w-full h-full'
      newElement.style.minHeight = '600px'
      newElement.id = 'force-map-' + Date.now()
      parentContainer.appendChild(newElement)
      
      mapRef.current = newElement
      setMapElement(newElement)
      
      console.log('✅ Force created DOM element:', newElement)
      setTimeout(() => initMap(), 100)
    } else {
      setMapError('Родительский контейнер не найден')
    }
  }

  // Парсим координаты событий
  const eventMarkers = events
    .filter(event => event.coordinates)
    .map(event => {
      try {
        const coords = event.coordinates.split(',').map(Number)
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          return {
            id: event.id,
            coordinates: [coords[0], coords[1]] as [number, number],
            event
          }
        }
      } catch (error) {
        console.warn('Invalid coordinates for event:', event.id, event.coordinates)
      }
      return null
    })
    .filter(Boolean)

  const loadYandexMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Проверяем, не загружен ли уже скрипт
      if (typeof window !== 'undefined' && (window as any).ymaps) {
        console.log('✅ Yandex Maps already loaded')
        resolve()
        return
      }

      // Проверяем, не загружается ли уже
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]')
      if (existingScript) {
        console.log('⏳ Yandex Maps script already loading')
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () => reject(new Error('Script load error')))
        return
      }

      console.log('🚀 Loading Yandex Maps script...')
      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=package.full'
      script.async = true
      
      script.onload = () => {
        console.log('✅ Yandex Maps script loaded successfully')
        resolve()
      }
      
      script.onerror = () => {
        console.log('❌ Yandex Maps script load error')
        reject(new Error('Failed to load Yandex Maps script'))
      }

      document.head.appendChild(script)
    })
  }

  const initMap = async () => {
    try {
      console.log('🔄 Starting map initialization...')
      setLoadingStep('Загрузка API Яндекс.Карт...')
      
      await loadYandexMapsScript()
      
      console.log('✅ Script loaded, initializing map...')
      setLoadingStep('Инициализация карты...')
      
      // Ждем готовности DOM элемента
      if (!mapRef.current) {
        console.log('⏳ Map container not ready, waiting...')
        setLoadingStep('Ожидание готовности DOM...')
        
        // Попробуем несколько раз с интервалом
        let attempts = 0
        const checkDOM = () => {
          attempts++
          console.log(`🔍 DOM check attempt ${attempts}`)
          
          if (mapRef.current) {
            console.log('✅ DOM ready, proceeding with map creation')
            createMap()
            return
          }
          
          if (attempts < 10) {
            setTimeout(checkDOM, 200) // Проверяем каждые 200мс
          } else {
            console.log('❌ DOM not ready after 10 attempts')
            throw new Error('Map container not ready after 10 attempts')
          }
        }
        
        checkDOM()
        return
      }

      createMap()
    } catch (error) {
      console.error('❌ Map initialization error:', error)
      setMapError(error instanceof Error ? error.message : 'Ошибка инициализации карты')
      setLoadingStep('')
    }
  }

  const createMap = () => {
    try {
      console.log('🗺️ Creating map...')
      setLoadingStep('Создание карты...')
      
      // Принудительно создаем DOM элемент если его нет
      if (!mapRef.current) {
        console.log('⚠️ Map ref still null, creating DOM element manually...')
        const parentContainer = document.querySelector('.w-full.h-\\[600px\\].rounded-lg.overflow-hidden')
        if (parentContainer) {
          // Очищаем контейнер
          parentContainer.innerHTML = ''
          
          // Создаем новый элемент
          const newMapElement = document.createElement('div')
          newMapElement.className = 'w-full h-full'
          newMapElement.style.minHeight = '600px'
          newMapElement.id = 'map-container-' + Date.now()
          
          parentContainer.appendChild(newMapElement)
          
          // Обновляем ref
          mapRef.current = newMapElement
          console.log('✅ DOM element created manually:', newMapElement)
        } else {
          throw new Error('Parent container not found for manual DOM creation')
        }
      }
      
      if (typeof window !== 'undefined' && window.ymaps) {
        window.ymaps.ready(() => {
          console.log('✅ Yandex Maps ready, creating map...')
          setLoadingStep('Создание карты...')
          
          const mapInstance = new window.ymaps.Map(mapRef.current, {
            center: [cityCenter.lat, cityCenter.lng],
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
          })

        console.log('✅ Map created successfully')
        setMap(mapInstance)
        setIsMapLoaded(true)
        setMapError(null)
        setLoadingStep('')

        // Подгоняем размер карты
        try { 
          mapInstance.container.fitToViewport() 
        } catch (e) {
          console.warn('Could not fit to viewport:', e)
        }

        // Добавляем маркеры
        console.log('📍 Adding markers...')
        setLoadingStep('Добавление маркеров...')
        
        eventMarkers.forEach((marker, index) => {
          try {
            const placemark = new window.ymaps.Placemark(
              marker.coordinates,
              {
                balloonContent: `
                  <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; color: #333;">${marker.event.title}</h3>
                    <p style="margin: 0; color: #666; font-size: 12px;">${marker.event.description || 'Описание отсутствует'}</p>
                    <p style="margin: 5px 0 0 0; color: #888; font-size: 11px;">${marker.event.startDate || 'Дата не указана'}</p>
                  </div>
                `,
                iconContent: `${index + 1}`,
                hintContent: marker.event.title
              },
              {
                preset: 'islands#redIcon',
                iconColor: '#ff0000'
              }
            )
            
            mapInstance.geoObjects.add(placemark)
            console.log(`✅ Marker ${index + 1} added:`, marker.event.title)
          } catch (error) {
            console.error(`❌ Error adding marker ${index + 1}:`, error)
          }
        })

        console.log(`✅ All ${eventMarkers.length} markers added successfully`)
        setLoadingStep('')
        
        // Обновляем размер карты при изменении размера окна
        const handleResize = () => {
          try { 
            mapInstance.container.fitToViewport() 
          } catch (e) {
            console.warn('Could not fit to viewport on resize:', e)
          }
        }
        window.addEventListener('resize', handleResize)

        // Очистка при размонтировании
        mapInstance.events.add('destroy', () => {
          window.removeEventListener('resize', handleResize)
        })
        })
      } else {
        throw new Error('Yandex Maps API not available')
      }
    } catch (error) {
      console.error('❌ Map creation error:', error)
      setMapError(error instanceof Error ? error.message : 'Ошибка создания карты')
      setLoadingStep('')
    }
  }

  // Автоматическая инициализация при монтировании компонента
  useEffect(() => {
    console.log('🔄 Component mounted, starting auto-initialization...')
    
    // Даем время для рендеринга DOM
    const timer = setTimeout(() => {
      console.log('🔄 Timer triggered, checking DOM...')
      
      if (mapRef.current || mapElement) {
        console.log('✅ DOM ready, initializing map')
        initMap()
      } else {
        console.log('⚠️ DOM not ready, trying again...')
        // Еще одна попытка через 500мс
        setTimeout(() => {
          if (mapRef.current || mapElement) {
            console.log('✅ DOM ready on retry, initializing map')
            initMap()
          } else {
            console.log('❌ DOM still not ready, showing error')
            setMapError('DOM элемент карты не готов')
          }
        }, 500)
      }
    }, 500) // Увеличиваем задержку для надежности

    return () => clearTimeout(timer)
  }, []) // Пустой массив зависимостей - выполняется только при монтировании

  // Дополнительная инициализация при изменении mapElement
  useEffect(() => {
    if (mapElement && !isMapLoaded && !mapError) {
      console.log('🎯 Map element ready, initializing map...')
      setTimeout(() => {
        initMap()
      }, 100)
    }
  }, [mapElement, isMapLoaded, mapError])

  // Fallback инициализация при изменении событий
  useEffect(() => {
    if (events.length > 0 && !isMapLoaded && !mapError) {
      console.log('🔄 Events loaded, trying to initialize map...')
      setTimeout(() => {
        if (mapRef.current || mapElement) {
          console.log('✅ DOM ready after events load, initializing map')
          initMap()
        }
      }, 200)
    }
  }, [events.length, isMapLoaded, mapError])

  // Принудительная инициализация через 3 секунды
  useEffect(() => {
    const forceTimer = setTimeout(() => {
      if (!isMapLoaded && !mapError) {
        console.log('🔧 Force initialization after 3 seconds...')
        if (mapRef.current || mapElement) {
          console.log('✅ DOM ready for force init, initializing map')
          initMap()
        } else {
          console.log('🔧 DOM still not ready, forcing DOM creation...')
          forceCreateDOM()
        }
      }
    }, 3000)

    return () => clearTimeout(forceTimer)
  }, [isMapLoaded, mapError])

  useEffect(() => {
    console.log('🚀 SimpleMapVisual mounted')
    console.log('📍 City center:', cityCenter)
    console.log('📊 Events count:', events.length)
    console.log('📍 Event markers:', eventMarkers.length)
    
    // Простая очистка при размонтировании
    return () => {
      if (map && typeof map.destroy === 'function') {
        try { 
          map.destroy() 
        } catch (e) {
          console.warn('Error destroying map:', e)
        }
      }
    }
  }, [cityCenter.lat, cityCenter.lng])

  if (mapError) {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Ошибка загрузки карты</h3>
          <p className="text-gray-500 mb-4">{mapError}</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setMapError(null)
                initMap()
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
            
            <button
              onClick={() => {
                console.log('🔄 Force initialization button clicked')
                setMapError(null)
                setLoadingStep('Принудительная инициализация...')
                forceCreateDOM()
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors block w-full"
            >
              Принудительная инициализация
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isMapLoaded) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Анимированная иконка карты */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            {/* Вращающийся индикатор */}
            <div className="absolute -top-2 -right-2 w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          {/* Заголовок */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Загрузка карты</h3>
          
          {/* Текущий этап */}
          {loadingStep && (
            <div className="mb-4">
              <p className="text-lg text-blue-600 font-medium">{loadingStep}</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}

          {/* Статистика событий */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <p className="text-gray-600 mb-2">Найдено событий</p>
            <p className="text-3xl font-bold text-blue-600">{events.length}</p>
            <p className="text-sm text-gray-500 mt-1">Маркеров: {eventMarkers.length}</p>
          </div>

          {/* Анимированные точки */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Подождите, карта загружается...</p>
            <p className="text-xs mt-2">Центр: {cityCenter.lat.toFixed(4)}, {cityCenter.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-green-500 shadow-lg relative">
      <div 
        ref={mapRefCallback} 
        className="w-full h-full" 
        style={{ minHeight: '600px' }}
        data-map-container="true"
      />
      
      {/* Индикатор успешной загрузки */}
      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
        ✅ Карта загружена
      </div>
      
      {/* Счетчик маркеров */}
      <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
        📍 {eventMarkers.length} маркеров
      </div>
      
      {/* Отладочная информация */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        DOM: {mapElement ? '✅' : '❌'} | Ref: {mapRef.current ? '✅' : '❌'}
      </div>
    </div>
  )
}
