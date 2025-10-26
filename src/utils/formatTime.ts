/**
 * Форматирует дату в относительное время (например, "5 мин. назад", "2 ч. назад")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'Только что'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`
  } else if (diffInDays < 7) {
    return `${diffInDays} дн. назад`
  } else {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * Форматирует дату в полный формат (например, "15 января 2024, 14:30")
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Форматирует дату в короткий формат (например, "15 янв, 14:30")
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
