// src/lib/analytics.ts
"use client"

// Утилиты для отслеживания поведения пользователей

export interface AnalyticsEvent {
  eventType: string
  page: string
  element?: string
  data?: unknown
}

class Analytics {
  private sessionId: string
  private userId?: number

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.userId = this.getUserId()
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return ''
    
    let sessionId = localStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  private getUserId(): number | undefined {
    if (typeof window === 'undefined') return undefined
    
    const userId = localStorage.getItem('user_id')
    return userId ? parseInt(userId) : undefined
  }

  private async track(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          sessionId: this.sessionId,
          ...event
        })
      })
    } catch (error) {
      console.error('Ошибка отправки аналитики:', error)
    }
  }

  // Отслеживание просмотра страницы
  pageView(page: string, data?: unknown) {
    this.track({
      eventType: 'page_view',
      page,
      data
    })
  }

  // Отслеживание клика
  click(element: string, page: string, data?: unknown) {
    this.track({
      eventType: 'click',
      page,
      element,
      data
    })
  }

  // Отслеживание скролла
  scroll(page: string, data?: unknown) {
    this.track({
      eventType: 'scroll',
      page,
      data
    })
  }

  // Отслеживание отправки формы
  formSubmit(formName: string, page: string, data?: unknown) {
    this.track({
      eventType: 'form_submit',
      page,
      element: formName,
      data
    })
  }

  // Отслеживание добавления в избранное
  addToFavorites(itemId: number, itemType: string, page: string) {
    this.track({
      eventType: 'add_to_favorites',
      page,
      element: `${itemType}_${itemId}`,
      data: { itemId, itemType }
    })
  }

  // Отслеживание бронирования
  booking(itemId: number, itemType: string, page: string, data?: unknown) {
    this.track({
      eventType: 'booking',
      page,
      element: `${itemType}_${itemId}`,
      data: { itemId, itemType, ...data }
    })
  }

  // Отслеживание поиска
  search(query: string, filters: unknown, page: string) {
    this.track({
      eventType: 'search',
      page,
      element: 'search_input',
      data: { query, filters }
    })
  }

  // Отслеживание фильтрации
  filter(filterType: string, value: unknown, page: string) {
    this.track({
      eventType: 'filter',
      page,
      element: filterType,
      data: { filterType, value }
    })
  }

  // Отслеживание времени на странице
  timeOnPage(page: string, timeSpent: number) {
    this.track({
      eventType: 'time_on_page',
      page,
      data: { timeSpent }
    })
  }

  // Отслеживание ошибок
  error(errorType: string, errorMessage: string, page: string, data?: unknown) {
    this.track({
      eventType: 'error',
      page,
      element: errorType,
      data: { errorType, errorMessage, ...data }
    })
  }

  // Отслеживание конверсии
  conversion(conversionType: string, value: number, page: string, data?: unknown) {
    this.track({
      eventType: 'conversion',
      page,
      element: conversionType,
      data: { conversionType, value, ...data }
    })
  }
}

// Создаем единственный экземпляр
export const analytics = new Analytics()

// Хук для автоматического отслеживания времени на странице
export function usePageTracking(page: string) {
  if (typeof window === 'undefined') return

  const startTime = Date.now()

  // Отслеживаем просмотр страницы
  analytics.pageView(page)

  // Отслеживаем время на странице при уходе
  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    analytics.timeOnPage(page, timeSpent)
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  // Очистка при размонтировании
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

// Хук для отслеживания скролла
export function useScrollTracking(page: string, threshold: number = 50) {
  if (typeof window === 'undefined') return

  let lastScrollTime = 0
  const scrollThrottle = 1000 // 1 секунда

  const handleScroll = () => {
    const now = Date.now()
    if (now - lastScrollTime < scrollThrottle) return

    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )

    if (scrollPercent >= threshold) {
      analytics.scroll(page, { scrollPercent })
      lastScrollTime = now
    }
  }

  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}
