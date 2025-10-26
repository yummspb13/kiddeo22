'use client'

import { useState, useEffect } from 'react'
import { useUser } from './useUser'
import { getFavorites, addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '@/lib/favorites-persistent'

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

export function useFavoritesClient() {
  const { user, loading: userLoading } = useUser()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Загружаем избранное при изменении пользователя
  useEffect(() => {
    console.log('🔍 useFavoritesClient useEffect - User:', user, 'UserLoading:', userLoading, 'LastUserId:', lastUserId, 'Initialized:', initialized)
    
    if (user?.id && user.id !== lastUserId) {
      console.log('🔍 useFavoritesClient - New user detected, loading favorites')
      setLastUserId(user.id)
      loadFavorites()
    } else if (!userLoading && !user?.id) {
      console.log('🔍 useFavoritesClient - No user, clearing favorites')
      setFavorites([])
      setLoading(false)
      setLastUserId(null)
      setInitialized(false)
    } else if (user?.id && !initialized) {
      console.log('🔍 useFavoritesClient - Initial load for user')
      setInitialized(true)
      loadFavorites()
    }
  }, [user?.id, userLoading, lastUserId, initialized])

  const loadFavorites = () => {
    if (!user?.id) return

    console.log('🔍 loadFavorites - UserId:', user.id)
    const userFavorites = getFavorites(parseInt(user.id))
    console.log('🔍 loadFavorites - Loaded favorites:', userFavorites)
    
    // Стабилизируем состояние - обновляем только если данные действительно изменились
    setFavorites(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(userFavorites)) {
        console.log('🔍 loadFavorites - Favorites changed, updating state')
        return userFavorites
      } else {
        console.log('🔍 loadFavorites - Favorites unchanged, keeping current state')
        return prev
      }
    })
    setLoading(false)
  }

  const addToFavorites = (itemId: string, itemType: string, itemData: Partial<Favorite>) => {
    if (!user?.id) {
      alert('Необходимо войти в систему для добавления в избранное')
      return false
    }

    console.log('🔍 addToFavorites - UserId:', user.id, 'ItemId:', itemId, 'ItemType:', itemType)

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

    addFavorite(parseInt(user.id), favorite)
    loadFavorites()
    return true
  }

  const removeFromFavorites = (favoriteId: string) => {
    if (!user?.id) return false

    console.log('🔍 removeFromFavorites - UserId:', user.id, 'FavoriteId:', favoriteId)
    
    const removed = removeFavorite(parseInt(user.id), favoriteId)
    if (removed) {
      loadFavorites()
    }
    return removed
  }

  const isFavorite = (itemId: string, itemType: string) => {
    if (!user?.id) return false
    return checkIsFavorite(parseInt(user.id), itemId, itemType)
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
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refetch: loadFavorites
  }
}
