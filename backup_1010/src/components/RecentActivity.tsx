'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/utils/formatTime'

interface Activity {
  id: string
  type: string
  action: string
  title: string
  slug: string
  rating: number
  status: string
  createdAt: string
}

interface RecentActivityProps {
  onStatsUpdate?: () => void
}

export default function RecentActivity({ onStatsUpdate }: RecentActivityProps) {
  const [user, setUser] = useState<{ id: number; name: string | null; email: string | null; image: string | null } | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalActivities, setTotalActivities] = useState(0)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [paginatedActivities, setPaginatedActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetchUser()
  }, [])

  // Эффект для пагинации активности
  useEffect(() => {
    if (activities.length === 0) {
      setPaginatedActivities([])
      setTotalActivities(0)
      setTotalPages(1)
      return
    }

    setTotalActivities(activities.length)
    setTotalPages(Math.ceil(activities.length / 10))

    const startIndex = (currentPage - 1) * 10
    const endIndex = startIndex + 10
    setPaginatedActivities(activities.slice(startIndex, endIndex))
  }, [activities, currentPage])

  const fetchUser = async () => {
    try {
      console.log('🔍 Fetching current user for recent activity')
      const response = await fetch('/api/simple-user')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ User data for recent activity:', data)
        if (data.success) {
          setUser(data.user)
          fetchActivities(data.user.id)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user for recent activity:', error)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchActivities = async (userId: number) => {
    try {
      console.log('🔍 Fetching recent activity for user:', userId)
      const response = await fetch('/api/profile/recent-activity', {
        headers: {
          'x-user-id': userId.toString()
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Recent activity fetched:', data)
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600'
      case 'MODERATION':
        return 'text-yellow-600'
      case 'REJECTED':
        return 'text-red-600'
      case 'HIDDEN':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрен'
      case 'MODERATION':
        return 'На модерации'
      case 'REJECTED':
        return 'Отклонен'
      case 'HIDDEN':
        return 'Скрыт'
      default:
        return 'Неизвестно'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-4 text-gray-500">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Пользователь не авторизован</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Вы зарегистрировались в системе</span>
          <span className="text-xs text-gray-400 ml-auto">Сегодня</span>
        </div>
        <div className="text-center py-4 text-gray-500">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Пока нет активности</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Недавняя активность</h3>
        <div className="text-sm text-gray-500">
          {totalActivities} активностей
        </div>
      </div>

      {paginatedActivities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm text-gray-600">{activity.action}</span>
              <Link 
                href={`/event/${activity.slug}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
              >
                {activity.title}
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex space-x-1">
                {renderStars(activity.rating)}
              </div>
              <span className={`${getStatusColor(activity.status)}`}>
                {getStatusText(activity.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link
              href={`/event/${activity.slug}`}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Посмотреть событие"
            >
              <Eye className="w-3 h-3" />
            </Link>
            <span className="text-xs text-gray-400">{formatRelativeTime(activity.createdAt)}</span>
          </div>
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
    </div>
  )
}
