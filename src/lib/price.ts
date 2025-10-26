// src/lib/price.ts
export function getMinActivePrice(ticketsStr: string | null | undefined, isPaid?: boolean | null): number | null {
  // Сначала проверяем билеты, если они есть
  if (ticketsStr) {
    try {
      const data = JSON.parse(ticketsStr)
      if (Array.isArray(data) && data.length > 0) {
        const active = data.filter((t: unknown) => t && t.isActive && typeof t.price === "number")
        if (active.length > 0) {
          return Math.min(...active.map((t: unknown) => t.price))
        }
      }
    } catch {
      // Если не удалось распарсить билеты, продолжаем
    }
  }
  
  // Если билетов нет, событие всегда бесплатное
  if (!ticketsStr) return 0
  
  // Если билеты есть, но неактивны, используем флаг isPaid
  if (isPaid === false) return 0
  if (isPaid === true) return null // платное, но цены неизвестны
  return null // неизвестно
}

// Новая функция для определения типа мероприятия
export function getEventType(ticketsStr: string | null | undefined, isPaid?: boolean | null): 'free' | 'free-registration' | 'paid' {
  // Если билетов нет, событие бесплатное без записи
  if (!ticketsStr) return 'free'
  
  // Если билеты есть, проверяем их цены
  try {
    const data = JSON.parse(ticketsStr)
    if (Array.isArray(data) && data.length > 0) {
      const active = data.filter((t: unknown) => t && t.isActive && typeof t.price === "number")
      if (active.length > 0) {
        const minPrice = Math.min(...active.map((t: unknown) => t.price))
        if (minPrice === 0) return 'free-registration' // бесплатно, но нужна запись
        return 'paid' // платное
      }
    }
  } catch {
    // Если не удалось распарсить билеты, используем флаг isPaid
  }
  
  // Если билеты неактивны, используем флаг isPaid
  if (isPaid === false) return 'free'
  if (isPaid === true) return 'paid'
  return 'free' // по умолчанию считаем бесплатным
}

export function inRange(value: number, range: { min?: number | null; max?: number | null }): boolean {
  const { min, max } = range
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}
