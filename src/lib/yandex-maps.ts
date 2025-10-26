// Глобальный менеджер для загрузки Яндекс карт
let isYandexMapsLoading = false
let isYandexMapsLoaded = false
const loadingCallbacks: (() => void)[] = []
let loadingTimeout: NodeJS.Timeout | null = null

declare global {
  interface Window {
    ymaps: unknown
  }
}

export const loadYandexMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🔄 loadYandexMaps called')
    
    // Если уже загружены
    if (isYandexMapsLoaded && window.ymaps) {
      console.log('✅ Yandex Maps already loaded')
      resolve()
      return
    }

    // Если уже загружается
    if (isYandexMapsLoading) {
      console.log('⏳ Yandex Maps already loading, adding to queue')
      loadingCallbacks.push(resolve)
      return
    }

    // Если уже есть скрипт на странице
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]')
    if (existingScript) {
      console.log('📜 Existing script found')
      if (window.ymaps) {
        console.log('✅ Existing script already loaded')
        isYandexMapsLoaded = true
        resolve()
        return
      } else {
        console.log('⏳ Waiting for existing script to load...')
        // Ждем загрузки существующего скрипта с таймаутом
        const timeout = setTimeout(() => {
          console.log('❌ Timeout waiting for existing script')
          isYandexMapsLoading = false
          reject(new Error('Таймаут загрузки существующего скрипта Яндекс.Карт'))
        }, 10000) // 10 секунд

        existingScript.addEventListener('load', () => {
          console.log('✅ Existing script loaded')
          clearTimeout(timeout)
          isYandexMapsLoaded = true
          resolve()
        })
        existingScript.addEventListener('error', () => {
          console.log('❌ Existing script error')
          clearTimeout(timeout)
          isYandexMapsLoading = false
          reject(new Error('Ошибка загрузки существующего скрипта Яндекс.Карт'))
        })
        return
      }
    }

    // Начинаем загрузку
    console.log('🚀 Starting new script load...')
    isYandexMapsLoading = true

    // Таймаут для загрузки
    loadingTimeout = setTimeout(() => {
      console.log('❌ Script load timeout')
      isYandexMapsLoading = false
      reject(new Error('Таймаут загрузки Яндекс.Карт'))
    }, 15000) // 15 секунд

    const script = document.createElement('script')
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'your-yandex-maps-api-key'
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${apiKey}&load=package.full`
    script.async = true
    
    script.onload = () => {
      console.log('✅ Yandex Maps script loaded successfully')
      
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      
      isYandexMapsLoading = false
      isYandexMapsLoaded = true
      
      // Вызываем все ожидающие коллбэки
      loadingCallbacks.forEach(callback => callback())
      loadingCallbacks.length = 0
      
      resolve()
    }
    
    script.onerror = (error) => {
      console.log('❌ Script load error:', error)
      
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      
      isYandexMapsLoading = false
      
      // Попробуем альтернативный URL
      console.warn('🔄 Первый URL не загрузился, пробуем альтернативный...')
      const retryScript = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'your-yandex-maps-api-key'
      retryScript.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${apiKey}`
      retryScript.async = true
      
      retryScript.onload = () => {
        console.log('✅ Retry script loaded successfully')
        isYandexMapsLoaded = true
        loadingCallbacks.forEach(callback => callback())
        loadingCallbacks.length = 0
        resolve()
      }
      
      retryScript.onerror = (retryError) => {
        console.log('❌ Retry script also failed:', retryError)
        reject(new Error('Не удалось загрузить Яндекс.Карты после повторной попытки'))
      }
      
      document.head.appendChild(retryScript)
    }

    document.head.appendChild(script)
  })
}

export const isYandexMapsReady = (): boolean => {
  const ready = isYandexMapsLoaded && typeof window.ymaps !== 'undefined'
  console.log('🔍 isYandexMapsReady check:', {
    isYandexMapsLoaded,
    windowYmaps: typeof window.ymaps,
    ready
  })
  return ready
}

export const resetYandexMaps = (): void => {
  isYandexMapsLoading = false
  isYandexMapsLoaded = false
  loadingCallbacks.length = 0
  
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
  
  // Удаляем все скрипты Яндекс карт
  const scripts = document.querySelectorAll('script[src*="api-maps.yandex.ru"]')
  scripts.forEach(script => script.remove())
  
  // Очищаем глобальную переменную
  if (typeof window !== 'undefined') {
    try {
      delete (window as any).ymaps
    } catch (e) {
      // Игнорируем ошибки
    }
  }
}
