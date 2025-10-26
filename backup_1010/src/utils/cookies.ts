// Утилиты для работы с cookies

export interface CartItem {
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventImage?: string
  eventSlug?: string
  eventEndDate?: string
  tickets: Array<{ 
    ticketId: string | number; 
    quantity: number; 
    name: string; 
    price: number;
    maxQuantity?: number;
  }>
  total: number
  addedAt: string
}

// Устанавливаем cookie
export function setCookie(name: string, value: string, days: number = 20) {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  const cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  document.cookie = cookieString
}

// Получаем cookie
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

// Удаляем cookie
export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

// Сохраняем корзину в cookie для конкретного города
export function saveCartToCookie(city: string, cartItems: CartItem[]) {
  const cartKey = `cart_${city}`
  const cartData = JSON.stringify(cartItems)
  setCookie(cartKey, cartData, 20)
  
  // Отправляем событие для обновления счетчика корзины
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
}

// Загружаем корзину из cookie для конкретного города
export function loadCartFromCookie(city: string): CartItem[] {
  const cartKey = `cart_${city}`
  const cartData = getCookie(cartKey)
  
  if (!cartData) return []
  
  try {
    const parsed = JSON.parse(cartData)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка при загрузке корзины из cookie:', error)
    return []
  }
}

// Получаем текущий город из URL или localStorage
export function getCurrentCity(): string {
  if (typeof window === 'undefined') return 'moskva'
  
  // Сначала проверяем URL
  const pathname = window.location.pathname
  if (pathname.startsWith('/city/')) {
    const cityFromPath = pathname.split('/')[2]
    if (cityFromPath) return cityFromPath
  }
  
  // Затем проверяем localStorage
  const savedCity = localStorage.getItem('selectedCity')
  if (savedCity) return savedCity
  
  // По умолчанию Москва
  return 'moskva'
}

// Сохраняем выбранный город
export function saveCurrentCity(city: string) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('selectedCity', city)
}
