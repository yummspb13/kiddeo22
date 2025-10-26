'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Comment {
  id: number
  text: string
  author: {
    id: number
    name: string
    image?: string
  }
  createdAt: string
  replies: Comment[]
}

interface BlogCommentsProps {
  contentId: number
  userId?: number
}

export default function BlogComments({ contentId, userId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchComments()
  }, [contentId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/comments?contentId=${contentId}`)
      const data = await response.json()
      
      if (response.ok) {
        setComments(data.comments || [])
      } else {
        console.error('Error fetching comments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userId) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          userId,
          text: newComment.trim()
        }),
      })

      if (response.ok) {
        setNewComment('')
        fetchComments()
      } else {
        const error = await response.json()
        console.error('Error submitting comment:', error.error)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim() || !userId) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          userId,
          text: replyText.trim(),
          parentId
        }),
      })

      if (response.ok) {
        setReplyText('')
        setReplyingTo(null)
        fetchComments()
      } else {
        const error = await response.json()
        console.error('Error submitting reply:', error.error)
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}
    >
      <div className="flex space-x-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
          {comment.author.image ? (
            <Image
              src={comment.author.image}
              alt={comment.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <span className="text-sm font-medium">
              {comment.author.name.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
          
          {!isReply && userId && (
            <div className="mt-2">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {replyingTo === comment.id ? 'Отменить' : 'Ответить'}
              </button>
            </div>
          )}
          
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <form onSubmit={(e) => {
                e.preventDefault()
                handleSubmitReply(comment.id)
              }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите ответ..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim() || submitting}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Комментарии</h3>
      
      {/* Comment Form */}
      {userId ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="mb-8"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">👤</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Напишите комментарий..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex items-center justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Отправка...' : 'Отправить комментарий'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
              Войдите
            </a>
            {' '}или{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-800 underline">
              зарегистрируйтесь
            </a>
            {' '}чтобы оставить комментарий
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-lg p-4">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💬</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Пока нет комментариев</h4>
          <p className="text-gray-600">Станьте первым, кто оставит комментарий!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

