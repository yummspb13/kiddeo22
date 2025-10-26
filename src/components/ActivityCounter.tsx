'use client'

import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

interface ActivityCounterProps {
  onStatsUpdate?: () => void
}

export default function ActivityCounter({ onStatsUpdate }: ActivityCounterProps) {
  const [user, setUser] = useState<{ id: number; name: string | null; email: string | null; image: string | null } | null>(null)
  const [activityCount, setActivityCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/simple-user')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          fetchActivityCount(data.user.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user for activity counter:', error)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchActivityCount = async (userId: number) => {
    try {
      const response = await fetch('/api/profile/recent-activity', {
        headers: {
          'x-user-id': userId.toString()
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setActivityCount(data.activities?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching activity count:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="profile-card p-8 animate-fadeInUp md:hidden" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-unbounded-bold text-gray-900">Активности</h3>
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="profile-card p-8 animate-fadeInUp md:hidden" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-unbounded-bold text-gray-900">Активности</h3>
          <span className="text-3xl font-unbounded-bold text-gray-400">0</span>
        </div>
        <p className="text-gray-600 font-unbounded-regular">
          Пользователь не авторизован
        </p>
      </div>
    )
  }

  return (
    <div className="profile-card p-8 animate-fadeInUp md:hidden" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-unbounded-bold text-gray-900">Активности</h3>
        <span className="text-3xl font-unbounded-bold text-blue-600">{activityCount}</span>
      </div>
      <p className="text-gray-600 font-unbounded-regular">
        У вас есть {activityCount} активностей за последнее время
      </p>
    </div>
  )
}
