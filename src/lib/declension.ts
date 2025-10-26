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
 * Получение правильного склонения города для заголовков
 */
export function getCityPrepositionOnly(cityName: string): string {
  const city = cityName.toLowerCase()
  
  // Специальные случаи с правильным склонением
  if (city === 'москва') {
    return 'В МОСКВЕ';
  }
  
  if (city === 'санкт-петербург' || city === 'спб') {
    return 'В САНКТ-ПЕТЕРБУРГЕ';
  }
  
  if (city === 'екатеринбург') {
    return 'В ЕКАТЕРИНБУРГЕ';
  }
  
  if (city === 'новосибирск') {
    return 'В НОВОСИБИРСКЕ';
  }
  
  if (city === 'казань') {
    return 'В КАЗАНИ';
  }
  
  if (city === 'нижний новгород') {
    return 'В НИЖНЕМ НОВГОРОДЕ';
  }
  
  if (city === 'челябинск') {
    return 'В ЧЕЛЯБИНСКЕ';
  }
  
  if (city === 'омск') {
    return 'В ОМСКЕ';
  }
  
  if (city === 'самара') {
    return 'В САМАРЕ';
  }
  
  if (city === 'ростов-на-дону') {
    return 'В РОСТОВЕ-НА-ДОНУ';
  }
  
  if (city === 'уфа') {
    return 'В УФЕ';
  }
  
  if (city === 'красноярск') {
    return 'В КРАСНОЯРСКЕ';
  }
  
  if (city === 'пермь') {
    return 'В ПЕРМИ';
  }
  
  if (city === 'волгоград') {
    return 'В ВОЛГОГРАДЕ';
  }
  
  if (city === 'воронеж') {
    return 'В ВОРОНЕЖЕ';
  }
  
  if (city === 'саратов') {
    return 'В САРАТОВЕ';
  }
  
  if (city === 'краснодар') {
    return 'В КРАСНОДАРЕ';
  }
  
  if (city === 'тольятти') {
    return 'В ТОЛЬЯТТИ';
  }
  
  if (city === 'тюмень') {
    return 'В ТЮМЕНИ';
  }
  
  if (city === 'ижевск') {
    return 'В ИЖЕВСКЕ';
  }
  
  if (city === 'барнаул') {
    return 'В БАРНАУЛЕ';
  }
  
  if (city === 'ульяновск') {
    return 'В УЛЬЯНОВСКЕ';
  }
  
  if (city === 'владивосток') {
    return 'ВО ВЛАДИВОСТОКЕ';
  }
  
  if (city === 'ярославль') {
    return 'В ЯРОСЛАВЛЕ';
  }
  
  if (city === 'хабаровск') {
    return 'В ХАБАРОВСКЕ';
  }
  
  if (city === 'махачкала') {
    return 'В МАХАЧКАЛЕ';
  }
  
  if (city === 'томск') {
    return 'В ТОМСКЕ';
  }
  
  if (city === 'оренбург') {
    return 'В ОРЕНБУРГЕ';
  }
  
  if (city === 'кемерово') {
    return 'В КЕМЕРОВО';
  }
  
  if (city === 'новокузнецк') {
    return 'В НОВОКУЗНЕЦКЕ';
  }
  
  if (city === 'рязань') {
    return 'В РЯЗАНИ';
  }
  
  if (city === 'набережные челны') {
    return 'В НАБЕРЕЖНЫХ ЧЕЛНАХ';
  }
  
  if (city === 'астрахань') {
    return 'В АСТРАХАНИ';
  }
  
  if (city === 'пенза') {
    return 'В ПЕНЗЕ';
  }
  
  if (city === 'липецк') {
    return 'В ЛИПЕЦКЕ';
  }
  
  if (city === 'тула') {
    return 'В ТУЛЕ';
  }
  
  if (city === 'киров') {
    return 'В КИРОВЕ';
  }
  
  if (city === 'чебоксары') {
    return 'В ЧЕБОКСАРАХ';
  }
  
  if (city === 'калининград') {
    return 'В КАЛИНИНГРАДЕ';
  }
  
  if (city === 'брянск') {
    return 'В БРЯНСКЕ';
  }
  
  if (city === 'курск') {
    return 'В КУРСКЕ';
  }
  
  if (city === 'иваново') {
    return 'В ИВАНОВО';
  }
  
  if (city === 'магнитогорск') {
    return 'В МАГНИТОГОРСКЕ';
  }
  
  if (city === 'тверь') {
    return 'В ТВЕРИ';
  }
  
  if (city === 'ставрополь') {
    return 'В СТАВРОПОЛЕ';
  }
  
  if (city === 'нижний тагил') {
    return 'В НИЖНЕМ ТАГИЛЕ';
  }
  
  if (city === 'белгород') {
    return 'В БЕЛГОРОДЕ';
  }
  
  if (city === 'архангельск') {
    return 'В АРХАНГЕЛЬСКЕ';
  }
  
  if (city === 'владимир') {
    return 'ВО ВЛАДИМИРЕ';
  }
  
  if (city === 'сочи') {
    return 'В СОЧИ';
  }
  
  if (city === 'курган') {
    return 'В КУРГАНЕ';
  }
  
  if (city === 'смоленск') {
    return 'В СМОЛЕНСКЕ';
  }
  
  if (city === 'орёл') {
    return 'В ОРЛЕ';
  }
  
  if (city === 'череповец') {
    return 'В ЧЕРЕПОВЦЕ';
  }
  
  if (city === 'мурманск') {
    return 'В МУРМАНСКЕ';
  }
  
  if (city === 'сургут') {
    return 'В СУРГУТЕ';
  }
  
  if (city === 'волжский') {
    return 'В ВОЛЖСКОМ';
  }
  
  // По умолчанию используем "В" + название города
  return `В ${cityName.toUpperCase()}`;
}

/**
 * Форматирование числа с правильным склонением
 */
export function formatWithDeclension(count: number, declensionFn: (count: number) => string): string {
  return `${count} ${declensionFn(count)}`
}
