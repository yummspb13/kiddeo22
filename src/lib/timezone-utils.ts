/**
 * Утилиты для работы с часовыми поясами
 */

// Маппинг городов на часовые пояса
const CITY_TIMEZONES: { [key: string]: string } = {
  'Москва': 'Europe/Moscow',
  'Санкт-Петербург': 'Europe/Moscow',
  'Новосибирск': 'Asia/Novosibirsk',
  'Екатеринбург': 'Asia/Yekaterinburg',
  'Нижний Новгород': 'Europe/Moscow',
  'Казань': 'Europe/Moscow',
  'Челябинск': 'Asia/Yekaterinburg',
  'Омск': 'Asia/Omsk',
  'Самара': 'Europe/Samara',
  'Ростов-на-Дону': 'Europe/Moscow',
  'Уфа': 'Asia/Yekaterinburg',
  'Красноярск': 'Asia/Krasnoyarsk',
  'Воронеж': 'Europe/Moscow',
  'Пермь': 'Asia/Yekaterinburg',
  'Волгоград': 'Europe/Volgograd',
  'Краснодар': 'Europe/Moscow',
  'Саратов': 'Europe/Saratov',
  'Тюмень': 'Asia/Yekaterinburg',
  'Тольятти': 'Europe/Samara',
  'Ижевск': 'Europe/Samara',
  'Барнаул': 'Asia/Barnaul',
  'Ульяновск': 'Europe/Samara',
  'Иркутск': 'Asia/Irkutsk',
  'Хабаровск': 'Asia/Vladivostok',
  'Ярославль': 'Europe/Moscow',
  'Томск': 'Asia/Tomsk',
  'Оренбург': 'Asia/Yekaterinburg',
  'Кемерово': 'Asia/Novokuznetsk',
  'Рязань': 'Europe/Moscow',
  'Астрахань': 'Europe/Astrakhan',
  'Пенза': 'Europe/Moscow',
  'Липецк': 'Europe/Moscow',
  'Тула': 'Europe/Moscow',
  'Киров': 'Europe/Kirov',
  'Чебоксары': 'Europe/Moscow',
  'Калининград': 'Europe/Kaliningrad',
  'Брянск': 'Europe/Moscow',
  'Курск': 'Europe/Moscow',
  'Магнитогорск': 'Asia/Yekaterinburg',
  'Тверь': 'Europe/Moscow',
  'Ставрополь': 'Europe/Moscow',
  'Нижний Тагил': 'Asia/Yekaterinburg',
  'Белгород': 'Europe/Moscow',
  'Архангельск': 'Europe/Moscow',
  'Владимир': 'Europe/Moscow',
  'Сочи': 'Europe/Moscow',
  'Курган': 'Asia/Yekaterinburg',
  'Смоленск': 'Europe/Moscow',
  'Калуга': 'Europe/Moscow',
  'Чита': 'Asia/Chita',
  'Орёл': 'Europe/Moscow',
  'Волжский': 'Europe/Volgograd',
  'Череповец': 'Europe/Moscow',
  'Мурманск': 'Europe/Moscow',
  'Сургут': 'Asia/Yekaterinburg',
  'Вологда': 'Europe/Moscow',
  'Владикавказ': 'Europe/Moscow',
  'Саранск': 'Europe/Moscow',
  'Тамбов': 'Europe/Moscow',
  'Стерлитамак': 'Asia/Yekaterinburg',
  'Грозный': 'Europe/Moscow',
  'Якутск': 'Asia/Yakutsk',
  'Кострома': 'Europe/Moscow',
  'Комсомольск-на-Амуре': 'Asia/Vladivostok',
  'Петрозаводск': 'Europe/Moscow',
  'Таганрог': 'Europe/Moscow',
  'Нижневартовск': 'Asia/Yekaterinburg',
  'Йошкар-Ола': 'Europe/Moscow',
  'Братск': 'Asia/Irkutsk',
  'Новороссийск': 'Europe/Moscow',
  'Шахты': 'Europe/Moscow',
  'Нальчик': 'Europe/Moscow',
  'Дзержинск': 'Europe/Moscow',
  'Сыктывкар': 'Europe/Moscow',
  'Орск': 'Asia/Yekaterinburg',
  'Ангарск': 'Asia/Irkutsk',
  'Благовещенск': 'Asia/Yakutsk',
  'Прокопьевск': 'Asia/Novokuznetsk',
  'Химки': 'Europe/Moscow',
  'Псков': 'Europe/Moscow',
  'Бийск': 'Asia/Barnaul',
  'Энгельс': 'Europe/Saratov',
  'Рыбинск': 'Europe/Moscow',
  'Балашиха': 'Europe/Moscow',
  'Северодвинск': 'Europe/Moscow',
  'Подольск': 'Europe/Moscow',
  'Королёв': 'Europe/Moscow',
  'Сызрань': 'Europe/Samara',
  'Норильск': 'Asia/Krasnoyarsk',
  'Златоуст': 'Asia/Yekaterinburg',
  'Петропавловск-Камчатский': 'Asia/Kamchatka',
  'Каменск-Уральский': 'Asia/Yekaterinburg',
  'Люберцы': 'Europe/Moscow',
  'Мытищи': 'Europe/Moscow',
  'Первый': 'Europe/Moscow',
  'Коломна': 'Europe/Moscow',
  'Электросталь': 'Europe/Moscow',
  'Одинцово': 'Europe/Moscow',
  'Серпухов': 'Europe/Moscow',
  'Орехово-Зуево': 'Europe/Moscow',
  'Жуковский': 'Europe/Moscow',
  'Сергиев Посад': 'Europe/Moscow',
  'Королёв': 'Europe/Moscow',
  'Щёлково': 'Europe/Moscow',
  'Пушкино': 'Europe/Moscow',
  'Красногорск': 'Europe/Moscow',
  'Химки': 'Europe/Moscow',
  'Люберцы': 'Europe/Moscow'
}

/**
 * Получить часовой пояс для города
 */
export function getTimezoneForCity(cityName: string): string {
  // Нормализуем название города
  const normalizedCity = cityName.trim()
  
  // Ищем точное совпадение
  if (CITY_TIMEZONES[normalizedCity]) {
    return CITY_TIMEZONES[normalizedCity]
  }
  
  // Ищем частичное совпадение (для случаев с дополнительными словами)
  for (const [city, timezone] of Object.entries(CITY_TIMEZONES)) {
    if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
      return timezone
    }
  }
  
  // По умолчанию возвращаем московское время
  return 'Europe/Moscow'
}

/**
 * Получить смещение часового пояса в минутах от UTC
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  
  // Создаем дату в указанном часовом поясе
  const localTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
  const utcTime = new Date(utc.toLocaleString('en-US', { timeZone: 'UTC' }))
  
  return (localTime.getTime() - utcTime.getTime()) / (1000 * 60)
}

/**
 * Форматировать часовой пояс для отображения
 */
export function formatTimezone(timezone: string): string {
  const offset = getTimezoneOffset(timezone)
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
