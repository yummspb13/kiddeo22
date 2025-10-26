// Временное хранилище избранного в памяти
// В будущем заменить на базу данных

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

// Хранилище в памяти (временное решение)
const favoritesStore = new Map<string, Favorite[]>()

export function getFavorites(userId: number): Favorite[] {
  return favoritesStore.get(userId.toString()) || []
}

export function addFavorite(userId: number, favorite: Favorite): Favorite {
  const userFavorites = getFavorites(userId)
  userFavorites.push(favorite)
  favoritesStore.set(userId.toString(), userFavorites)
  return favorite
}

export function removeFavorite(userId: number, favoriteId: string): boolean {
  const userFavorites = getFavorites(userId)
  const initialLength = userFavorites.length
  const filtered = userFavorites.filter(fav => fav.id !== favoriteId)
  favoritesStore.set(userId.toString(), filtered)
  return filtered.length < initialLength
}

export function isFavorite(userId: number, itemId: string, itemType: string): boolean {
  const userFavorites = getFavorites(userId)
  return userFavorites.some(fav => fav.itemId === itemId && fav.itemType === itemType)
}
