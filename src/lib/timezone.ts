// Маппинг городов на их часовые пояса
export const CITY_TIMEZONES: Record<string, string> = {
  'moskva': 'Europe/Moscow',
  'spb': 'Europe/Moscow', 
  'novosibirsk': 'Asia/Novosibirsk',
  'ekaterinburg': 'Asia/Yekaterinburg',
  'kazan': 'Europe/Moscow',
  'nizhniy-novgorod': 'Europe/Moscow',
  'chelyabinsk': 'Asia/Yekaterinburg',
  'omsk': 'Asia/Omsk',
  'samara': 'Europe/Samara',
  'rostov-na-donu': 'Europe/Moscow',
  'ufa': 'Asia/Yekaterinburg',
  'krasnoyarsk': 'Asia/Krasnoyarsk',
  'voronezh': 'Europe/Moscow',
  'perm': 'Asia/Yekaterinburg',
  'volgograd': 'Europe/Volgograd',
  'krasnodar': 'Europe/Moscow',
  'saratov': 'Europe/Saratov',
  'tyumen': 'Asia/Yekaterinburg',
  'tolyatti': 'Europe/Samara',
  'izhevsk': 'Europe/Samara',
  'barnaul': 'Asia/Barnaul',
  'ulyanovsk': 'Europe/Samara'
}

/**
 * Получить часовой пояс для города по его slug
 */
export function getCityTimezone(citySlug: string): string {
  return CITY_TIMEZONES[citySlug] || 'Europe/Moscow'
}

/**
 * Получить текущую дату в часовом поясе города
 */
export function getCityDate(citySlug: string): Date {
  const timezone = getCityTimezone(citySlug)
  const now = new Date()
  
  // Создаем дату в нужном часовом поясе
  const cityDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  return cityDate
}

/**
 * Форматировать дату в часовом поясе города
 */
export function formatCityDate(date: Date, citySlug: string, format: 'iso' | 'display' = 'iso'): string {
  const timezone = getCityTimezone(citySlug)
  
  if (format === 'iso') {
    // Возвращаем дату в формате YYYY-MM-DD в часовом поясе города
    const cityDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const year = cityDate.getFullYear()
    const month = String(cityDate.getMonth() + 1).padStart(2, '0')
    const day = String(cityDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    // Возвращаем дату для отображения
    return date.toLocaleDateString('ru-RU', { 
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

/**
 * Получить день недели в часовом поясе города
 */
export function getCityDayOfWeek(citySlug: string): number {
  const cityDate = getCityDate(citySlug)
  return cityDate.getDay()
}

/**
 * Вычислить выходные для города в его часовом поясе
 */
export function getCityWeekend(citySlug: string): { saturday: string; sunday: string } {
  const cityDate = getCityDate(citySlug)
  const dayOfWeek = cityDate.getDay()
  
  let saturday: Date
  let sunday: Date
  
  if (dayOfWeek === 6) {
    // Если сегодня суббота в городе, берем сегодня и завтра
    saturday = new Date(cityDate)
    sunday = new Date(cityDate)
    sunday.setDate(cityDate.getDate() + 1)
  } else if (dayOfWeek === 0) {
    // Если сегодня воскресенье в городе, берем вчера и сегодня
    saturday = new Date(cityDate)
    saturday.setDate(cityDate.getDate() - 1)
    sunday = new Date(cityDate)
  } else {
    // Если будний день в городе, показываем ближайшие выходные
    const daysUntilNextSaturday = (6 - dayOfWeek + 7) % 7
    const actualDaysUntilSaturday = daysUntilNextSaturday === 0 ? 7 : daysUntilNextSaturday
    
    saturday = new Date(cityDate)
    saturday.setDate(cityDate.getDate() + actualDaysUntilSaturday)
    sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
  }
  
  return {
    saturday: formatCityDate(saturday, citySlug, 'iso'),
    sunday: formatCityDate(sunday, citySlug, 'iso')
  }
}
