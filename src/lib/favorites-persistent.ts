// Постоянное хранилище избранного в localStorage
// Работает между сессиями и перезагрузками

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
  endDate?: string
  userId: number
  createdAt: string
}

const STORAGE_KEY = 'kiddeo_favorites'

export function getFavorites(userId: number): Favorite[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const allFavorites = JSON.parse(stored)
    const userFavorites = allFavorites.filter((fav: Favorite) => fav.userId === userId)
    return userFavorites
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error)
    return []
  }
}

export function addFavorite(userId: number, favorite: Favorite): Favorite {
  if (typeof window === 'undefined') return favorite
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allFavorites = stored ? JSON.parse(stored) : []
    
    // Удаляем существующее избранное с тем же itemId и itemType
    const filtered = allFavorites.filter((fav: Favorite) => 
      !(fav.userId === userId && fav.itemId === favorite.itemId && fav.itemType === favorite.itemType)
    )
    
    // Добавляем новое
    filtered.push(favorite)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return favorite
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error)
    return favorite
  }
}

export function removeFavorite(userId: number, favoriteId: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    
    const allFavorites = JSON.parse(stored)
    const initialLength = allFavorites.length
    const filtered = allFavorites.filter((fav: Favorite) => 
      !(fav.userId === userId && fav.id === favoriteId)
    )
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return filtered.length < initialLength
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error)
    return false
  }
}

export function isFavorite(userId: number, itemId: string, itemType: string): boolean {
  if (typeof window === 'undefined') return false
  
  const userFavorites = getFavorites(userId)
  return userFavorites.some(fav => fav.itemId === itemId && fav.itemType === itemType)
}
