"use client"

import { useState, useEffect, useMemo } from "react"
import { MessageSquare, ThumbsUp, ThumbsDown, Edit, Trash2, Reply, Calendar, MapPin } from "lucide-react"
import { useComments } from "@/hooks/useComments"
import { useUser } from "@/hooks/useUser"

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

interface CommentsClientProps {}

export default function CommentsClient({}: CommentsClientProps) {
  const { user } = useUser()
  const { comments, loading: commentsLoading, deleteComment } = useComments()
  const [filter, setFilter] = useState<"all" | "pending" | "moderated">("all")
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(0)
  const [paginatedComments, setPaginatedComments] = useState<Comment[]>([])

  // Мемоизируем комментарии для предотвращения лишних перерендеров
  const memoizedComments = useMemo(() => comments, [comments.length, JSON.stringify(comments.map(c => c.id))])

  // Эффект для пагинации комментариев
  useEffect(() => {
    if (memoizedComments.length === 0) {
      setPaginatedComments([])
      setTotalComments(0)
      setTotalPages(1)
      return
    }

    const filteredComments = memoizedComments.filter(comment => {
      switch (filter) {
        case "pending":
          return !comment.isModerated
        case "moderated":
          return comment.isModerated
        default:
          return true
      }
    })

    setTotalComments(filteredComments.length)
    setTotalPages(Math.ceil(filteredComments.length / 10))

    const startIndex = (currentPage - 1) * 10
    const endIndex = startIndex + 10
    setPaginatedComments(filteredComments.slice(startIndex, endIndex))
  }, [memoizedComments, filter, currentPage])

  const getStatusColor = (isModerated: boolean) => {
    return isModerated 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800"
  }

  const getStatusText = (isModerated: boolean) => {
    return isModerated ? "Опубликован" : "На модерации"
  }

  const toggleReplies = (commentId: string) => {
    const newShowReplies = new Set(showReplies)
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId)
    } else {
      newShowReplies.add(commentId)
    }
    setShowReplies(newShowReplies)
  }

  const handleDeleteComment = (commentId: string, commentTitle: string) => {
    if (!confirm(`Вы уверены, что хотите удалить комментарий к статье "${commentTitle}"?`)) {
      return
    }

    const success = deleteComment(commentId)
    if (success) {
      // Комментарий будет удален через React Query
    }
  }

  const filteredComments = comments.filter(comment => {
    switch (filter) {
      case "pending":
        return !comment.isModerated
      case "moderated":
        return comment.isModerated
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header - мобильная версия */}
        <div className="block md:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">Мои комментарии</h1>
            <p className="text-gray-600 text-sm">
              Управляйте своими комментариями к статьям
            </p>
            <div className="text-sm text-gray-500">
              {memoizedComments.length} комментариев
            </div>
          </div>
        </div>

        {/* Header - десктопная версия */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Мои комментарии</h1>
              <p className="text-gray-600 mt-1">
                Управляйте своими комментариями к статьям
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {memoizedComments.length} комментариев
            </div>
          </div>
        </div>

        {/* Filters - мобильная версия */}
        <div className="block md:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Фильтр:</div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: "all", label: "Все комментарии" },
                { key: "pending", label: "На модерации" },
                { key: "moderated", label: "Опубликованные" }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as "all" | "pending" | "moderated")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                    filter === filterOption.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters - десктопная версия */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            {[
              { key: "all", label: "Все комментарии" },
              { key: "pending", label: "На модерации" },
              { key: "moderated", label: "Опубликованные" }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as "all" | "pending" | "moderated")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Комментарии</h3>
            <div className="text-sm text-gray-500">
              {totalComments} комментариев
            </div>
          </div>

          {commentsLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Загрузка комментариев...</h3>
              <p className="text-gray-500">Пожалуйста, подождите</p>
            </div>
          ) : paginatedComments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Комментариев не найдено</h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "Вы еще не оставили ни одного комментария к статьям"
                  : `Нет комментариев в категории "${filter === "pending" ? "На модерации" : "Опубликованные"}"`
                }
              </p>
            </div>
          ) : (
            <>
              {paginatedComments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{comment.eventTitle}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.isModerated)}`}>
                        {getStatusText(comment.isModerated)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{comment.venue}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Опубликована {new Date(comment.eventDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteComment(comment.id, comment.eventTitle)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Оставлен {new Date(comment.createdAt).toLocaleDateString('ru-RU')}</span>
                    {comment.replies > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>{comment.replies} ответов</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm font-medium">{comment.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies Section */}
                {showReplies.has(comment.id) && comment.replies > 0 && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-200">
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">Организатор</span>
                          <span className="text-xs text-gray-500">2 часа назад</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Спасибо за отзыв! Мы рады, что вам понравилось. Обязательно учтем ваши пожелания.
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-xs">3</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                            <ThumbsDown className="w-3 h-3" />
                            <span className="text-xs">0</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика комментариев к статьям</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{memoizedComments.length}</div>
              <div className="text-sm text-gray-500">Всего комментариев</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {memoizedComments.filter(c => c.isModerated).length}
              </div>
              <div className="text-sm text-gray-500">Опубликовано</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {memoizedComments.filter(c => !c.isModerated).length}
              </div>
              <div className="text-sm text-gray-500">На модерации</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {memoizedComments.reduce((sum, c) => sum + c.likes, 0)}
              </div>
              <div className="text-sm text-gray-500">Лайков получено</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
