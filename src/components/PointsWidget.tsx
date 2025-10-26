"use client"

import { Gift, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
// Убираем импорт шрифта, используем CSS переменную напрямую

export default function PointsWidget() {
  const { user } = useAuth()
  const { data, isLoading } = usePoints()

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <Gift className="w-5 h-5 animate-pulse" />
        <span className="text-sm">...</span>
      </div>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'NOVICE': return 'text-gray-600'
      case 'ACTIVE': return 'text-blue-600'
      case 'VIP': return 'text-purple-600'
      case 'PLATINUM': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'NOVICE': return <Gift className="w-5 h-5" />
      case 'ACTIVE': return <Star className="w-5 h-5" />
      case 'VIP': return <Star className="w-5 h-5" />
      case 'PLATINUM': return <Star className="w-5 h-5" />
      default: return <Gift className="w-5 h-5" />
    }
  }

  return (
    <Link 
      href="/profile/points"
      className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
      title="Мои баллы"
    >
      {getLevelIcon(data?.userPoints?.level || 'NOVICE')}
      <span className="font-semibold" style={{ fontFamily: 'var(--font-unbounded)' }}>{data?.userPoints?.points || 0}</span>
    </Link>
  )
}