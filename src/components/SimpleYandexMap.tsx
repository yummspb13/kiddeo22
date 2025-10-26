'use client'

import { useEffect, useRef, useState } from 'react'
import { loadYandexMaps, isYandexMapsReady, resetYandexMaps } from '@/lib/yandex-maps'

interface SimpleYandexMapProps {
  events: unknown[]
  cityCenter: { lat: number; lng: number }
  cityName: string
}

export default function SimpleYandexMap({ events, cityCenter, cityName }: SimpleYandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingStep, setLoadingStep] = useState('')
  const [forceError, setForceError] = useState(false)

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

  const loadMap = async () => {
    console.log('🔄 loadMap called')
    console.log('🌐 Window available:', typeof window !== 'undefined')
    console.log('🗺️ Map ref available:', !!mapRef.current)
    console.log('📍 Map ref element:', mapRef.current)
    
    if (typeof window === 'undefined') {
      console.log('❌ Window not available, skipping map load')
      setMapError('Браузерная среда недоступна')
      return
    }
    
    // Ждем готовности DOM элемента с более агрессивной проверкой
    if (!mapRef.current) {
      console.log('⏳ Map ref not ready, waiting for DOM...')
      setLoadingStep('Ожидание готовности DOM...')
      setIsLoading(true)
      
      // Попробуем несколько раз с интервалом
      let attempts = 0
      const checkDOM = () => {
        attempts++
        console.log(`🔍 DOM check attempt ${attempts}`)
        
        // Проверяем не только mapRef, но и наличие элемента в DOM
        const mapElement = document.querySelector('[data-map-container]')
        console.log('🔍 Map element in DOM:', mapElement)
        
        if (mapRef.current || mapElement) {
          console.log('✅ DOM ready, proceeding with map load')
          if (mapElement && !mapRef.current) {
            // Если нашли элемент в DOM, но ref не работает, попробуем альтернативный подход
            console.log('⚠️ Map element found in DOM but ref not working, trying alternative approach')
            setLoadingStep('Попытка альтернативной загрузки...')
            
            // Попробуем загрузить карту напрямую в найденный элемент
            setTimeout(() => {
              try {
                loadMapDirectly(mapElement)
              } catch (error) {
                console.error('❌ Alternative approach failed:', error)
                setMapError('Не удалось загрузить карту альтернативным способом')
                setIsLoading(false)
              }
            }, 100)
            return
          }
          loadMap() // Рекурсивный вызов
          return
        }
        
        if (attempts < 20) { // Увеличиваем количество попыток
          setTimeout(checkDOM, 100) // Уменьшаем интервал
        } else {
          console.log('❌ DOM not ready after 20 attempts')
          console.log('🔍 Final DOM state check:')
          console.log('- mapRef.current:', mapRef.current)
          console.log('- document.querySelector result:', document.querySelector('[data-map-container]'))
          console.log('- document.body contains map container:', document.body.innerHTML.includes('data-map-container'))
          
          // Попробуем принудительно найти элемент
          const allDivs = document.querySelectorAll('div')
          console.log('🔍 All divs count:', allDivs.length)
          
          // Попробуем создать новый элемент
          console.log('🔄 Trying to create new map container...')
          const newMapContainer = document.createElement('div')
          newMapContainer.setAttribute('data-map-container', 'true')
          newMapContainer.className = 'w-full h-full'
          newMapContainer.style.minHeight = '600px'
          
          // Попробуем найти родительский контейнер
          const parentContainer = document.querySelector('.w-full.h-\\[600px\\].rounded-lg.overflow-hidden')
          if (parentContainer) {
            console.log('✅ Found parent container, appending new map container')
            parentContainer.appendChild(newMapContainer)
            loadMapDirectly(newMapContainer)
            return
          }
          
          setMapError('DOM элемент карты не готов после 20 попыток. Попробуйте альтернативную загрузку.')
          setIsLoading(false)
        }
      }
      
      checkDOM()
      return
    }

    console.log('🔄 Starting map loading...')
    setIsLoading(true)
    setMapError(null)
    setLoadingStep('Инициализация...')
    setForceError(false)

    const initMap = () => {
      console.log('🗺️ Initializing map...')
      setLoadingStep('Проверка готовности API...')
      
      if (!isYandexMapsReady() || !mapRef.current || map) {
        console.log('❌ Map not ready or already exists')
        setLoadingStep('API не готов или карта уже существует')
        return
      }

      setLoadingStep('Создание экземпляра карты...')
      window.ymaps.ready(() => {
        console.log('✅ Yandex Maps ready, creating map instance...')
        if (!mapRef.current || map) return

        setLoadingStep('Настройка карты...')
        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: [cityCenter.lat, cityCenter.lng],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        })

        console.log('✅ Map instance created successfully')
        setLoadingStep('Добавление маркеров...')
        
        setMap(mapInstance)
        setIsMapLoaded(true)
        setMapError(null)
        setIsLoading(false)
        setLoadingStep('')

        // Подгоняем размер карты под контейнер
        try { mapInstance.container.fitToViewport() } catch {}

        // Обновляем размер карты при изменении размера окна
        const handleResize = () => {
          try { mapInstance.container.fitToViewport() } catch {}
        }
        window.addEventListener('resize', handleResize)

        // Очистка при размонтировании
        mapInstance.events.add('destroy', () => {
          window.removeEventListener('resize', handleResize)
        })
      })
    }

    try {
      console.log('🔄 Loading Yandex Maps API...')
      setLoadingStep('Загрузка API Яндекс.Карт...')
      await loadYandexMaps()
      console.log('✅ Yandex Maps API loaded, initializing map...')
      setLoadingStep('API загружен, инициализация карты...')
      initMap()
    } catch (error) {
      console.error('❌ Error loading Yandex Maps:', error)
      setMapError(error instanceof Error ? error.message : 'Ошибка загрузки Яндекс.Карт')
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    resetYandexMaps()
    setMap(null)
    setIsMapLoaded(false)
    setMapError(null)
    loadMap()
  }

  // Альтернативная функция загрузки карты напрямую в DOM элемент
  const loadMapDirectly = async (mapElement: Element) => {
    console.log('🔄 loadMapDirectly called with element:', mapElement)
    
    try {
      setLoadingStep('Загрузка API Яндекс.Карт...')
      await loadYandexMaps()
      
      setLoadingStep('Создание карты...')
      window.ymaps.ready(() => {
        console.log('✅ Yandex Maps ready for direct load')
        
        const mapInstance = new window.ymaps.Map(mapElement, {
          center: [cityCenter.lat, cityCenter.lng],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        })

        console.log('✅ Map instance created directly')
        setMap(mapInstance)
        setIsMapLoaded(true)
        setMapError(null)
        setIsLoading(false)
        setLoadingStep('')

        // Подгоняем размер карты под контейнер
        try { mapInstance.container.fitToViewport() } catch {}

        // Обновляем размер карты при изменении размера окна
        const handleResize = () => {
          try { mapInstance.container.fitToViewport() } catch {}
        }
        window.addEventListener('resize', handleResize)

        // Очистка при размонтировании
        mapInstance.events.add('destroy', () => {
          window.removeEventListener('resize', handleResize)
        })
      })
    } catch (error) {
      console.error('❌ Error in loadMapDirectly:', error)
      setMapError(error instanceof Error ? error.message : 'Ошибка альтернативной загрузки карты')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 SimpleYandexMap useEffect triggered')
    console.log('📍 City center:', cityCenter)
    console.log('📊 Events count:', events.length)
    console.log('🗺️ Map ref:', mapRef.current)
    
    // Ждем готовности DOM перед загрузкой карты
    const initTimer = setTimeout(() => {
      console.log('🔄 DOM ready timer triggered')
      loadMap()
    }, 100) // Небольшая задержка для инициализации DOM

    // Принудительно вызываем loadMap
    const timer = setTimeout(() => {
      if (!isLoading && !isMapLoaded && !mapError) {
        console.log('⚠️ Map not loading, forcing loadMap call')
        loadMap()
      }
    }, 500) // Увеличиваем задержку

    // Принудительный таймаут для отладки
    const forceTimeout = setTimeout(() => {
      if (isLoading && !isMapLoaded && !mapError) {
        console.log('⚠️ Force timeout triggered - map taking too long')
        setForceError(true)
        setMapError('Карта загружается слишком долго. Попробуйте перезагрузить.')
        setIsLoading(false)
      }
    }, 30000) // 30 секунд

    return () => {
      clearTimeout(initTimer)
      clearTimeout(timer)
      clearTimeout(forceTimeout)
      if (map && typeof map.destroy === 'function') {
        try { map.destroy() } catch {}
      }
    }
  }, [cityCenter.lat, cityCenter.lng])

  // Добавляем дополнительную отладку
  useEffect(() => {
    console.log('📊 State update:', {
      isLoading,
      isMapLoaded,
      mapError,
      loadingStep,
      retryCount,
      forceError
    })
  }, [isLoading, isMapLoaded, mapError, loadingStep, retryCount, forceError])

  // Принудительная загрузка при монтировании
  useEffect(() => {
    console.log('🚀 Component mounted, checking if map should load...')
    console.log('🗺️ Map ref on mount:', mapRef.current)
    
    // Ждем готовности DOM
    const mountTimer = setTimeout(() => {
      console.log('🔄 Mount timer triggered, checking DOM...')
      if (!isLoading && !isMapLoaded && !mapError) {
        console.log('⚠️ Map not loading on mount, forcing load...')
        loadMap()
      }
    }, 1000) // Увеличиваем задержку для монтирования

    // Принудительное завершение зависшего процесса
    const forceStopTimer = setTimeout(() => {
      if (isLoading && !isMapLoaded && !mapError) {
        console.log('⚠️ Force stopping stuck loading process')
        setIsLoading(false)
        setMapError('Процесс загрузки завис. Попробуйте альтернативную загрузку.')
        setLoadingStep('')
      }
    }, 10000) // 10 секунд

    return () => {
      clearTimeout(mountTimer)
      clearTimeout(forceStopTimer)
    }
  }, []) // Только при монтировании

  // Добавляем маркеры на карту
  useEffect(() => {
    if (!map || !isMapLoaded || eventMarkers.length === 0) return

    // Создаем коллекцию маркеров
    const collection = new window.ymaps.GeoObjectCollection({}, {
      preset: 'islands#redIcon'
    })

    eventMarkers.forEach((marker) => {
      if (!marker) return

      const placemark = new window.ymaps.Placemark(
        marker.coordinates,
        {
          balloonContentHeader: marker.event.title,
          balloonContentBody: `
            <div style="padding: 10px;">
              <p><strong>${marker.event.title}</strong></p>
              <p>${marker.event.description || ''}</p>
              <p><strong>Место:</strong> ${marker.event.venue || 'Не указано'}</p>
              <p><strong>Дата:</strong> ${(() => {
                try {
                  const date = new Date(marker.event.startDate)
                  if (Number.isNaN(date.getTime())) return 'Дата уточняется'
                  return date.toLocaleDateString('ru')
                } catch (error) {
                  return 'Дата уточняется'
                }
              })()}</p>
              <p><strong>Категория:</strong> ${marker.event.afishaCategory?.name || 'Не указана'}</p>
            </div>
          `,
          balloonContentFooter: `<a href="/moscow/event/${marker.event.slug}" target="_blank">Подробнее</a>`
        },
        {
          preset: 'islands#redIcon'
        }
      )

      collection.add(placemark)
    })

    // Добавляем коллекцию на карту
    map.geoObjects.add(collection)

    // Очистка при размонтировании
    return () => {
      if (map && map.geoObjects) {
        map.geoObjects.removeAll()
      }
    }
  }, [map, isMapLoaded, eventMarkers])

  if (mapError) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Ошибка загрузки карты</h3>
          <p className="text-gray-500 mb-4">{mapError}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400 mt-2">Попытка {retryCount + 1}</p>
          )}
        </div>
      </div>
    )
  }

  if (isLoading || !isMapLoaded) {
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
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Статистика событий */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <p className="text-gray-600 mb-2">Найдено событий</p>
            <p className="text-3xl font-bold text-blue-600">{events.length}</p>
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
            {retryCount > 0 && (
              <p className="text-orange-600">Попытка {retryCount + 1}</p>
            )}
            
            {/* Кнопки управления */}
            <div className="mt-4 space-x-2">
              <button
                onClick={handleRetry}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Принудительная перезагрузка
              </button>
              
              {!isLoading && !isMapLoaded && !mapError && (
                <button
                  onClick={() => {
                    console.log('🔄 Manual load map button clicked')
                    loadMap()
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Загрузить карту
                </button>
              )}
              
              {mapError && mapError.includes('DOM') && (
                <button
                  onClick={() => {
                    console.log('🔄 Alternative load map button clicked')
                    const mapElement = document.querySelector('[data-map-container]')
                    if (mapElement) {
                      loadMapDirectly(mapElement)
                    } else {
                      setMapError('DOM элемент не найден для альтернативной загрузки')
                    }
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  Альтернативная загрузка
                </button>
              )}
              
              {mapError && (mapError.includes('DOM') || mapError.includes('завис')) && (
                <button
                  onClick={() => {
                    console.log('🔄 Force create map container button clicked')
                    const parentContainer = document.querySelector('.w-full.h-\\[600px\\].rounded-lg.overflow-hidden')
                    if (parentContainer) {
                      // Очищаем существующий контент
                      parentContainer.innerHTML = ''
                      
                      // Создаем новый контейнер карты
                      const newMapContainer = document.createElement('div')
                      newMapContainer.setAttribute('data-map-container', 'true')
                      newMapContainer.className = 'w-full h-full'
                      newMapContainer.style.minHeight = '600px'
                      
                      parentContainer.appendChild(newMapContainer)
                      console.log('✅ New map container created')
                      
                      // Загружаем карту
                      loadMapDirectly(newMapContainer)
                    } else {
                      setMapError('Родительский контейнер не найден')
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Принудительное создание
                </button>
              )}
            </div>
            
            {/* Отладочная информация */}
            <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
              <p>Отладка:</p>
              <p>isLoading: {isLoading.toString()}</p>
              <p>isMapLoaded: {isMapLoaded.toString()}</p>
              <p>mapError: {mapError || 'null'}</p>
              <p>loadingStep: {loadingStep || 'null'}</p>
              <p>retryCount: {retryCount}</p>
              <p>forceError: {forceError.toString()}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <div 
        ref={mapRef} 
        data-map-container="true"
        className="w-full h-full"
        style={{ minHeight: '600px' }}
        onLoad={() => console.log('🗺️ Map container loaded')}
      />
    </div>
  )
}
