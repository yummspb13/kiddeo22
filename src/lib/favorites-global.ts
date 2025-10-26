// Глобальное хранилище избранного для предотвращения повторной загрузки
// Работает между компонентами и рендерами

interface Favorite {
  id: string
  itemId: string
  itemType: string
  title: string
  description?: string
  image?: string
  price?: number
  currency?: string
  location?: string
  date?: string
  userId: number
  createdAt: string
}

// Глобальное состояние
let globalFavorites: Map<number, Favorite[]> = new Map()
let globalLoading: Map<number, boolean> = new Map()
let listeners: Set<() => void> = new Set()

// Уведомляем всех слушателей об изменении
function notifyListeners() {
  listeners.forEach(listener => listener())
}

// Получаем избранное для пользователя
export function getGlobalFavorites(userId: number): Favorite[] {
  return globalFavorites.get(userId) || []
}

// Устанавливаем избранное для пользователя
export function setGlobalFavorites(userId: number, favorites: Favorite[]) {
  globalFavorites.set(userId, favorites)
  notifyListeners()
}

// Добавляем в избранное
export function addGlobalFavorite(userId: number, favorite: Favorite) {
  const current = getGlobalFavorites(userId)
  const updated = [...current, favorite]
  setGlobalFavorites(userId, updated)
}

// Удаляем из избранного
export function removeGlobalFavorite(userId: number, favoriteId: string) {
  const current = getGlobalFavorites(userId)
  const updated = current.filter(fav => fav.id !== favoriteId)
  setGlobalFavorites(userId, updated)
}

// Проверяем, находится ли элемент в избранном
export function isGlobalFavorite(userId: number, itemId: string, itemType: string): boolean {
  const favorites = getGlobalFavorites(userId)
  return favorites.some(fav => fav.itemId === itemId && fav.itemType === itemType)
}

// Устанавливаем состояние загрузки
export function setGlobalLoading(userId: number, loading: boolean) {
  globalLoading.set(userId, loading)
  notifyListeners()
}

// Получаем состояние загрузки
export function getGlobalLoading(userId: number): boolean {
  return globalLoading.get(userId) || false
}

// Подписываемся на изменения
export function subscribeToFavorites(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}
