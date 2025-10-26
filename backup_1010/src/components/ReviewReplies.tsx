'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, User, Clock, Trash2 } from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import { formatRelativeTime } from '@/utils/formatTime'
import { emitActivityEvent } from '@/hooks/useNotifications'
import { useNotifications } from '@/hooks/useNotifications'

interface Reply {
  id: string
  message: string
  createdAt: string
  user: {
    id: number
    name: string | null
    image: string | null
  }
}

interface ReviewRepliesProps {
  reviewId: string
  replies: Reply[]
  currentUserId?: number
  onReplyAdded?: () => void
  showReplyButton?: boolean
}

export default function ReviewReplies({ 
  reviewId, 
  replies: initialReplies, 
  currentUserId, 
  onReplyAdded,
  showReplyButton = true
}: ReviewRepliesProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    replyId: string | null
  }>({
    isOpen: false,
    replyId: null
  })
  const { showSuccess, showError } = useNotifications()

  const handleDeleteReply = (replyId: string) => {
    setConfirmModal({
      isOpen: true,
      replyId
    })
  }

  const confirmDeleteReply = async () => {
    if (!confirmModal.replyId) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId: confirmModal.replyId })
      })

      if (response.ok) {
        showSuccess('Ответ удален', 'Ответ успешно удален')
        setReplies(prev => prev.filter(reply => reply.id !== confirmModal.replyId))
        onReplyAdded?.()
      } else {
        const error = await response.json()
        showError('Ошибка', error.error || 'Ошибка при удалении ответа')
      }
    } catch (error) {
      console.error('Error deleting reply:', error)
      showError('Ошибка', 'Ошибка при удалении ответа')
    }
  }

  useEffect(() => {
    setReplies(initialReplies)
  }, [initialReplies])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !currentUserId) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          userId: currentUserId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReplies(prev => [...prev, data.reply])
          setReplyMessage('')
          setShowReplyForm(false)
          onReplyAdded?.()
          
          // Отправляем уведомление о создании ответа
          emitActivityEvent('review_reply_received', {
            replyId: data.reply.id,
            replyAuthorName: data.reply.user.name,
            eventTitle: 'Мероприятие' // Можно передать из props
          })
          
          // Показываем уведомление об успехе
          showSuccess('Ответ добавлен!', 'Ваш ответ успешно опубликован')
          
          // Обновляем уведомления в реальном времени
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-notifications'))
          }, 1000)
        }
      } else {
        const error = await response.json()
        showError('Ошибка', error.error || 'Ошибка при отправке ответа')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      showError('Ошибка', 'Ошибка при отправке ответа')
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="mt-4 space-y-3" data-review-id={reviewId}>
      {/* Кнопка "Ответить" */}
      {currentUserId && showReplyButton && (
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {showReplyForm ? 'Отменить' : 'Ответить'}
        </button>
      )}

      {/* Форма ответа */}
      {showReplyForm && currentUserId && (
        <form onSubmit={handleSubmitReply} className="bg-gray-50 rounded-lg p-4 reply-form">
          <div className="mb-3">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Напишите ответ на отзыв..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false)
                setReplyMessage('')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting || !replyMessage.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}

      {/* Список ответов */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              {/* Аватар */}
              <div className="flex-shrink-0">
                {reply.user.image ? (
                  <img
                    src={reply.user.image}
                    alt={reply.user.name || 'Пользователь'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Контент ответа */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {reply.user.name || 'Пользователь'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(reply.createdAt)}
                    </div>
                  </div>
                  
                  {/* Кнопка удаления ответа */}
                  {currentUserId && reply.user.id === parseInt(currentUserId.toString()) && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Удалить ответ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {reply.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно подтверждения удаления ответа */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, replyId: null })}
        onConfirm={confirmDeleteReply}
        title="Подтвердите действие"
        message="Уверены, что хотели бы удалить ответ?"
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />
    </div>
  )
}
