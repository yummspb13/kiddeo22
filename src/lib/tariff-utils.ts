export type VenueTariff = 'FREE' | 'SUPER' | 'MAXIMUM'

export interface TariffLimits {
  photos: number
  newsPerMonth: number
  hasRichDescription: boolean
  hasFeatures: boolean
  hasAnalytics: boolean
  hasPriceFields: boolean
  hasQASection: boolean
}

export interface VenueTariffData {
  tariff: VenueTariff
  tariffExpiresAt: string | null
  tariffGracePeriodEndsAt: string | null
  newsCountThisMonth: number
  newsResetAt: string | null
}

export function getTariffLimits(tariff: VenueTariff): TariffLimits {
  switch (tariff) {
    case 'FREE':
      return {
        photos: 4,
        newsPerMonth: 0,
        hasRichDescription: false,
        hasFeatures: false,
        hasAnalytics: false,
        hasPriceFields: false,
        hasQASection: false
      }
    case 'SUPER':
      return {
        photos: 10,
        newsPerMonth: 3,
        hasRichDescription: true,
        hasFeatures: true,
        hasAnalytics: true,
        hasPriceFields: true,
        hasQASection: true
      }
    case 'MAXIMUM':
      return {
        photos: 15,
        newsPerMonth: 5,
        hasRichDescription: true,
        hasFeatures: true,
        hasAnalytics: true,
        hasPriceFields: true,
        hasQASection: true
      }
    default:
      return getTariffLimits('FREE')
  }
}

export function getTariffStatus(venueData: VenueTariffData): {
  status: 'free' | 'active' | 'expiring' | 'grace_period' | 'expired'
  message: string
  daysUntilExpiry?: number
  gracePeriodDays?: number
} {
  const now = new Date()
  const expiresAt = venueData.tariffExpiresAt ? new Date(venueData.tariffExpiresAt) : null
  const gracePeriodEnds = venueData.tariffGracePeriodEndsAt ? new Date(venueData.tariffGracePeriodEndsAt) : null

  if (venueData.tariff === 'FREE') {
    return { status: 'free', message: 'Бесплатный тариф' }
  }

  if (gracePeriodEnds && now < gracePeriodEnds) {
    const daysLeft = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { 
      status: 'grace_period', 
      message: `Grace period: ${daysLeft} дней`,
      gracePeriodDays: daysLeft
    }
  }

  if (expiresAt && now > expiresAt) {
    return { status: 'expired', message: 'Тариф истек' }
  }

  if (expiresAt) {
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 7) {
      return { 
        status: 'expiring', 
        message: `Истекает через ${daysLeft} дней`,
        daysUntilExpiry: daysLeft
      }
    }
    return { 
      status: 'active', 
      message: `Активен: ${daysLeft} дней`,
      daysUntilExpiry: daysLeft
    }
  }

  return { status: 'active', message: 'Активен' }
}

export function canUseFeature(venueData: VenueTariffData, feature: keyof TariffLimits): boolean {
  const limits = getTariffLimits(venueData.tariff)
  const status = getTariffStatus(venueData)
  
  // Если тариф истек и не в grace period, блокируем все платные функции
  if (status.status === 'expired') {
    return feature === 'photos' // Только базовые фото разрешены
  }
  
  return Boolean(limits[feature])
}

export function getTariffUpgradeMessage(currentTariff: VenueTariff, feature: string): string {
  const messages = {
    photos: 'Для загрузки большего количества фото обновите тариф до "Супер"',
    news: 'Для публикации новостей обновите тариф до "Супер"',
    richDescription: 'Для расширенного описания обновите тариф до "Супер"',
    features: 'Для добавления особенностей обновите тариф до "Супер"',
    analytics: 'Для просмотра аналитики обновите тариф до "Супер"',
    priceFields: 'Для указания цен обновите тариф до "Супер"',
    qa: 'Для раздела "Вопросы и ответы" обновите тариф до "Супер"'
  }
  
  return messages[feature as keyof typeof messages] || 'Обновите тариф для использования этой функции'
}

export function getTariffLabel(tariff: VenueTariff): string {
  const labels = {
    FREE: 'Бесплатный',
    SUPER: 'Супер',
    MAXIMUM: 'Максимум'
  }
  return labels[tariff]
}

export function getTariffColor(tariff: VenueTariff): string {
  const colors = {
    FREE: 'bg-gray-100 text-gray-800',
    SUPER: 'bg-blue-100 text-blue-800',
    MAXIMUM: 'bg-purple-100 text-purple-800'
  }
  return colors[tariff]
}
