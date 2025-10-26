'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from './useUser'
import { isFavorite as checkIsFavorite } from '@/lib/favorites-persistent'
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
  endDate?: string
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
      
      try {
        // Загружаем из API (база данных)
        const response = await fetch('/api/profile/simple-favorites', {
          headers: {
            'x-user-id': user.id.toString(),
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const duration = Date.now() - startTime;
        
        
        // Обновляем глобальное хранилище
        setGlobalFavorites(parseInt(user.id), data.favorites || []);
        
        return data.favorites || [];
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

      const response = await fetch('/api/profile/simple-favorites', {
        method: 'POST',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemType,
          title: itemData.title || 'Без названия',
          description: itemData.description || null,
          image: itemData.image || null,
          price: itemData.price || null,
          currency: itemData.currency || 'RUB',
          location: itemData.location || null,
          date: itemData.date || null,
          endDate: itemData.endDate || null,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add to favorites')
      }

      const data = await response.json()
      
      // Обновляем глобальное состояние
      addGlobalFavorite(parseInt(user.id), data.favorite)
      
      return data.favorite
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
      
      const response = await fetch(`/api/profile/simple-favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Если избранное не найдено на сервере, считаем это успехом
          // и обновляем локальный кэш
          removeGlobalFavorite(parseInt(user.id), favoriteId)
          return true
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove from favorites')
      }

      // Обновляем глобальное состояние
      removeGlobalFavorite(parseInt(user.id), favoriteId)
      
      return true
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

    
    addToFavoritesMutation.mutate({ itemId, itemType, itemData })
    return true
  }

  const removeFromFavorites = (favoriteId: string) => {
    if (!user?.id) return false

    
    removeFromFavoritesMutation.mutate(favoriteId)
    return true
  }

  const isFavorite = (itemId: string, itemType: string) => {
    if (!user?.id) return false
    return isGlobalFavorite(parseInt(user.id), itemId, itemType)
  }

  const toggleFavorite = (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    const existingFavorite = favorites.find(fav => fav.itemId === itemId && fav.itemType === itemType)
    
    if (existingFavorite) {
      return removeFromFavorites(existingFavorite.id)
    } else {
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
