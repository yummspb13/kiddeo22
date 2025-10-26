'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from './useUser'
import { getFavorites, addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '@/lib/favorites-persistent'
import { 
  getGlobalFavorites, 
  setGlobalFavorites, 
  addGlobalFavorite, 
  removeGlobalFavorite, 
  isGlobalFavorite,
  subscribeToFavorites 
} from '@/lib/favorites-global'
import { logger } from '@/lib/logger'

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
  createdAt: string
}

export function useFavoritesSimple() {
  const { user, loading: userLoading } = useUser()
  const queryClient = useQueryClient()

  // Используем React Query для кеширования избранного
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const startTime = Date.now();
      logger.debug('Favorites', 'Loading favorites for user', { userId: user.id });
      
      try {
        // Загружаем из localStorage
        const localFavorites = getFavorites(parseInt(user.id));
        const duration = Date.now() - startTime;
        
        logger.info('Favorites', 'Favorites loaded successfully', { 
          userId: user.id, 
          count: localFavorites.length,
          duration 
        });
        
        // Обновляем глобальное хранилище
        setGlobalFavorites(parseInt(user.id), localFavorites);
        
        return localFavorites;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Favorites', 'Failed to load favorites', { 
          userId: user.id, 
          error, 
          duration 
        });
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Мутация для добавления в избранное
  const addToFavoritesMutation = useMutation({
    mutationFn: async ({ itemId, itemType, itemData }: { itemId: string, itemType: string, itemData: Partial<Favorite> }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const favorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId,
        itemType,
        title: itemData.title || 'Без названия',
        description: itemData.description || null,
        image: itemData.image || null,
        price: itemData.price || null,
        currency: itemData.currency || 'RUB',
        location: itemData.location || null,
        date: itemData.date || null,
        userId: parseInt(user.id),
        createdAt: new Date().toISOString()
      }

      // Сохраняем в localStorage
      addFavorite(parseInt(user.id), favorite)
      // Обновляем глобальное состояние
      addGlobalFavorite(parseInt(user.id), favorite)
      
      return favorite
    },
    onSuccess: () => {
      // Инвалидируем кеш избранного
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  // Мутация для удаления из избранного
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      // Удаляем из localStorage
      const removed = removeFavorite(parseInt(user.id), favoriteId)
      if (removed) {
        // Обновляем глобальное состояние
        removeGlobalFavorite(parseInt(user.id), favoriteId)
      }
      return removed
    },
    onSuccess: () => {
      // Инвалидируем кеш избранного
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  const addToFavorites = (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    if (!user?.id) {
      alert('Необходимо войти в систему для добавления в избранное')
      return false
    }

    console.log('🔍 addToFavorites - UserId:', user.id, 'ItemId:', itemId, 'ItemType:', itemType)
    
    addToFavoritesMutation.mutate({ itemId, itemType, itemData })
    return true
  }

  const removeFromFavorites = (favoriteId: string) => {
    if (!user?.id) return false

    console.log('🔍 removeFromFavorites - UserId:', user.id, 'FavoriteId:', favoriteId)
    
    removeFromFavoritesMutation.mutate(favoriteId)
    return true
  }

  const isFavorite = (itemId: string, itemType: string) => {
    if (!user?.id) return false
    return isGlobalFavorite(parseInt(user.id), itemId, itemType)
  }

  const toggleFavorite = (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    console.log('🔍 toggleFavorite - ItemId:', itemId, 'ItemType:', itemType, 'Current favorites:', favorites)
    
    const existingFavorite = favorites.find(fav => fav.itemId === itemId && fav.itemType === itemType)
    console.log('🔍 toggleFavorite - Existing favorite:', existingFavorite)
    
    if (existingFavorite) {
      console.log('🔍 toggleFavorite - Removing favorite')
      return removeFromFavorites(existingFavorite.id)
    } else {
      console.log('🔍 toggleFavorite - Adding favorite')
      return addToFavorites(itemId, itemType, itemData)
    }
  }

  return {
    favorites,
    loading: userLoading || isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  }
}
