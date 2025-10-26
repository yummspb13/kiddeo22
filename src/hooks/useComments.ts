'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from './useUser'

interface Comment {
  id: string
  eventTitle: string
  venue: string
  content: string
  isModerated: boolean
  likes: number
  dislikes: number
  replies: number
  createdAt: string
  eventDate: string
  parentId?: string
}

export function useComments() {
  const { user, loading: userLoading } = useUser()
  const queryClient = useQueryClient()

  // Получаем комментарии пользователя
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const response = await fetch('/api/profile/comments', {
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.comments || []
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Мутация для удаления комментария
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/profile/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete comment')
      }

      return true
    },
    onSuccess: () => {
      // Инвалидируем кеш комментариев
      queryClient.invalidateQueries({ queryKey: ['comments', user?.id] })
    }
  })

  const deleteComment = (commentId: string) => {
    if (!user?.id) return false
    deleteCommentMutation.mutate(commentId)
    return true
  }

  return {
    comments,
    loading: userLoading || isLoading,
    deleteComment,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', user?.id] })
    }
  }
}
