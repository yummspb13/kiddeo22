"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Heart, Star, ShoppingBag, MessageCircle } from "lucide-react"
import ProfileStats from "@/components/ProfileStats"
import ProfileReviews from "@/components/ProfileReviews"
import RecentActivity from "@/components/RecentActivity"

export default function ProfileOverview() {
  const [statsKey, setStatsKey] = useState(0)

  const handleStatsUpdate = () => {
    setStatsKey(prev => prev + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Обзор профиля</h2>
        
        {/* Quick Stats */}
        <ProfileStats key={statsKey} onStatsUpdate={handleStatsUpdate} />

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Последняя активность</h3>
          <RecentActivity onStatsUpdate={handleStatsUpdate} />
        </div>

        {/* Recent Reviews */}
        <ProfileReviews onStatsUpdate={handleStatsUpdate} />

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/profile/children"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Добавить ребенка</div>
                <div className="text-sm text-gray-500">Укажите данные ваших детей</div>
              </div>
            </Link>
            <Link
              href="/profile/favorites"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-6 h-6 text-red-600" />
              <div>
                <div className="font-medium text-gray-900">Избранное</div>
                <div className="text-sm text-gray-500">Сохраненные события</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
