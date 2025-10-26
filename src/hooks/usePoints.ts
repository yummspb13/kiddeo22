'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'

interface UserPoints {
  points: number
  totalEarned: number
  totalSpent: number
  level: 'NOVICE' | 'ACTIVE' | 'VIP' | 'PLATINUM'
}

interface PointTransaction {
  id: string
  amount: number
  type: string
  description: string
  relatedId?: string
  currentPoints: number
  createdAt: string
}

interface Reward {
  id: string
  title: string
  description: string
  requiredPoints: number
  isActive: boolean
}

interface UserReward {
  id: string
  reward: Reward
  redeemedAt: string
}

interface PointsData {
  userPoints: UserPoints
  recentTransactions: PointTransaction[]
  availableRewards: Reward[]
  usedRewards: UserReward[]
}

export function usePoints() {
  const queryClient = useQueryClient()
  const [isClient, setIsClient] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Быстрая проверка сессии без таймаута
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { 
          cache: 'no-store',
          signal: AbortSignal.timeout(1000) // 1 сек таймаут
        });
        const data = await res.json();
        setHasSession(!!data?.user?.id);
      } catch (err) {
        setHasSession(false);
      }
    };
    
    checkSession();
  }, [])

  // Загрузка данных о баллах
  const { data, isLoading, error } = useQuery<PointsData>({
    queryKey: ['points'],
    queryFn: async () => {
      const response = await fetch('/api/points', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch points')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000, // 5 минут
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: isClient && hasSession === true
  })

  // Мутация для добавления баллов
  const addPointsMutation = useMutation({
    mutationFn: async ({ points, type, description, relatedId }: {
      points: number
      type: string
      description: string
      relatedId?: string
    }) => {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          points,
          type,
          description,
          relatedId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add points')
      }

      return response.json()
    },
    onSuccess: () => {
      // Инвалидируем кеш баллов
      queryClient.invalidateQueries({ queryKey: ['points'] })
    }
  })

  const addPoints = (points: number, type: string, description: string, relatedId?: string) => {
    addPointsMutation.mutate({ points, type, description, relatedId })
  }

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['points'] })
  }

  return {
    data,
    isLoading,
    error,
    addPoints,
    refetch,
    isAddingPoints: addPointsMutation.isPending
  }
}
