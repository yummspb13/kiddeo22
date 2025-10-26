'use client'

import { useState, useEffect } from 'react'
import { useUser } from './useUser'

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

export function useFavorites() {
  const { user, loading: userLoading } = useUser()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  // Загружаем избранное при изменении пользователя
  useEffect(() => {
    if (user?.id) {
      fetchFavorites()
    } else if (!userLoading) {
      setFavorites([])
      setLoading(false)
    }
  }, [user?.id, userLoading])

  const fetchFavorites = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/profile/simple-favorites', {
        headers: {
          'x-user-id': user.id
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = async (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    if (!user?.id) {
      alert('Необходимо войти в систему для добавления в избранное')
      return false
    }

    console.log('🔍 addToFavorites - UserId:', user.id, 'ItemId:', itemId, 'ItemType:', itemType)

    try {
      const response = await fetch('/api/profile/simple-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          itemId,
          itemType,
          ...itemData
        })
      })

      console.log('🔍 addToFavorites - Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 addToFavorites - Data received:', data)
        return true
      } else {
        const error = await response.json()
        console.error('🔍 addToFavorites - Error response:', error)
        alert(error.error || 'Ошибка при добавлении в избранное')
        return false
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      alert('Ошибка при добавлении в избранное')
      return false
    }
  }

  const removeFromFavorites = async (favoriteId: string) => {
    if (!user?.id) return false

    try {
      const response = await fetch(`/api/profile/simple-favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        console.log('🔍 removeFromFavorites - Successfully removed')
        return true
      } else {
        const error = await response.json()
        console.error('🔍 removeFromFavorites - Error response:', error)
        alert(error.error || 'Ошибка при удалении из избранного')
        return false
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      alert('Ошибка при удалении из избранного')
      return false
    }
  }

  const isFavorite = (itemId: string, itemType: string) => {
    return favorites.some(fav => fav.itemId === itemId && fav.itemType === itemType)
  }

  const toggleFavorite = async (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    console.log('🔍 toggleFavorite - ItemId:', itemId, 'ItemType:', itemType, 'Current favorites:', favorites)
    
    const existingFavorite = favorites.find(fav => fav.itemId === itemId && fav.itemType === itemType)
    console.log('🔍 toggleFavorite - Existing favorite:', existingFavorite)
    
    if (existingFavorite) {
      console.log('🔍 toggleFavorite - Removing favorite')
      const success = await removeFromFavorites(existingFavorite.id)
      if (success) {
        // Обновляем локальное состояние
        setFavorites(prev => prev.filter(fav => fav.id !== existingFavorite.id))
      }
      return success
    } else {
      console.log('🔍 toggleFavorite - Adding favorite')
      const success = await addToFavorites(itemId, itemType, itemData)
      if (success) {
        // Обновляем локальное состояние
        await fetchFavorites()
      }
      return success
    }
  }

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  }
}
