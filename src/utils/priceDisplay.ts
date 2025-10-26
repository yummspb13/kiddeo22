export interface PriceDisplayResult {
  mainText: string
  subText: string
  isFree: boolean
}

export function getPriceDisplay(venue: {
  tariff?: 'FREE' | 'SUPER' | 'MAXIMUM'
  priceFrom?: number | null
  priceTo?: number | null
  isFree?: boolean
}): PriceDisplayResult {
  // Для FREE тарифа используем новую логику с ценами
  if (venue.tariff === 'FREE') {
    if (venue.priceFrom === 0 || venue.priceFrom === -1) {
      return {
        mainText: 'Бесплатно',
        subText: 'Бесплатное место',
        isFree: true
      }
    }
    
    if (venue.priceFrom === null && venue.priceTo === null) {
      return {
        mainText: 'По запросу',
        subText: 'Уточните стоимость',
        isFree: false
      }
    }
    
    return {
      mainText: 'По запросу',
      subText: 'Уточните стоимость',
      isFree: false
    }
  }

  // Для платных тарифов (SUPER/MAXIMUM) используем старую логику (isFree)
  if (venue.isFree === true) {
    return {
      mainText: 'Бесплатно',
      subText: 'Бесплатное место',
      isFree: true
    }
  }

  if (venue.priceFrom && venue.priceTo) {
    return {
      mainText: `${venue.priceFrom}₽ - ${venue.priceTo}₽`,
      subText: '',
      isFree: false
    }
  }
  
  if (venue.priceFrom) {
    return {
      mainText: `от ${venue.priceFrom}₽`,
      subText: '',
      isFree: false
    }
  }
  
  return {
    mainText: 'Цена по запросу',
    subText: '',
    isFree: false
  }
}
