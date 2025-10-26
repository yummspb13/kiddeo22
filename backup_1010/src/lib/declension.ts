// Утилиты для склонения русских слов

/**
 * Склонение слова "событие" в зависимости от числа
 */
export function declensionEvents(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'событий'
  }

  if (lastDigit === 1) {
    return 'событие'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'события'
  }

  return 'событий'
}

/**
 * Склонение слова "мероприятие" в зависимости от числа
 */
export function declensionEventsAlt(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'мероприятий'
  }

  if (lastDigit === 1) {
    return 'мероприятие'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'мероприятия'
  }

  return 'мероприятий'
}

/**
 * Склонение слова "билет" в зависимости от числа
 */
export function declensionTickets(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'билетов'
  }

  if (lastDigit === 1) {
    return 'билет'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'билета'
  }

  return 'билетов'
}

/**
 * Склонение слова "место" в зависимости от числа
 */
export function declensionPlaces(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'мест'
  }

  if (lastDigit === 1) {
    return 'место'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'места'
  }

  return 'мест'
}

/**
 * Склонение слова "категория" в зависимости от числа
 */
export function declensionCategories(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'категорий'
  }

  if (lastDigit === 1) {
    return 'категория'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'категории'
  }

  return 'категорий'
}

/**
 * Склонение слова "просмотр" в зависимости от числа
 */
export function declensionViews(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'просмотров'
  }

  if (lastDigit === 1) {
    return 'просмотр'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'просмотра'
  }

  return 'просмотров'
}

/**
 * Склонение слова "избранное" в зависимости от числа
 */
export function declensionFavorites(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'избранных'
  }

  if (lastDigit === 1) {
    return 'избранное'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'избранных'
  }

  return 'избранных'
}

/**
 * Получение правильного предлога для города
 */
export function getCityPreposition(cityName: string): string {
  const city = cityName.toLowerCase()
  
  if (city === 'москва' || city === 'москве') {
    return 'в Москве'
  }
  
  if (city === 'санкт-петербург' || city === 'спб') {
    return 'в Санкт-Петербурге'
  }
  
  if (city === 'екатеринбург') {
    return 'в Екатеринбурге'
  }
  
  if (city === 'новосибирск') {
    return 'в Новосибирске'
  }
  
  if (city === 'казань') {
    return 'в Казани'
  }
  
  if (city === 'нижний новгород') {
    return 'в Нижнем Новгороде'
  }
  
  // Для других городов используем общий случай
  return `в ${cityName}`
}

/**
 * Форматирование числа с правильным склонением
 */
export function formatWithDeclension(count: number, declensionFn: (count: number) => string): string {
  return `${count} ${declensionFn(count)}`
}
