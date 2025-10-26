"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import { User, Users, Heart, Star, MessageSquare, Bell, Settings, Gift, ShoppingBag, FileText, TrendingUp, Calendar, Award, Zap } from "lucide-react"
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'
import ActivityCounter from '@/components/ActivityCounter'

const unbounded = Unbounded({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-unbounded'
})

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ProfileClientProps {
  user?: User
}

export default function ProfileClient({ user: serverUser }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { user: clientUser } = useAuthBridge()
  
  // Используем клиентскую сессию, если доступна, иначе серверную
  const user = clientUser || serverUser

  const menuItems = [
    { id: "overview", label: "Обзор", icon: User },
    { id: "children", label: "Мои дети", icon: Users, count: 0 },
    { id: "orders", label: "Мои заказы", icon: ShoppingBag, count: 0 },
    { id: "favorites", label: "Избранное", icon: Heart, count: 0 },
    { id: "reviews", label: "Отзывы", icon: Star, count: 0 },
    { id: "comments", label: "Комментарии", icon: MessageSquare, count: 0 },
    { id: "points", label: "Баллы", icon: Gift, count: 0 },
    { id: "notifications", label: "Уведомления", icon: Bell, count: 0 },
    { id: "settings", label: "Настройки", icon: Settings },
  ]

  return (
    <div className={`space-y-8 ${unbounded.variable}`}>
      {/* Welcome Section */}
      <div className="profile-card p-8 animate-fadeInUp">
        <div className="text-center">
          <h2 className="text-3xl font-unbounded-bold text-gradient mb-4">
            Добро пожаловать в ваш кабинет! 👋
          </h2>
          <p className="text-lg text-gray-600 mb-6 font-unbounded-regular">
            Здесь вы можете управлять своими данными, заказами и настройками
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <div className="stat-card blue">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">0</div>
          <div className="text-sm text-gray-600 font-unbounded-regular">Мои дети</div>
          <div className="text-xs text-green-600 mt-2 font-unbounded-medium">+0 за месяц</div>
        </div>

        <div className="stat-card green">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">0</div>
          <div className="text-sm text-gray-600 font-unbounded-regular">Заказов</div>
          <div className="text-xs text-blue-600 mt-2 font-unbounded-medium">0 в этом месяце</div>
        </div>

        <div className="stat-card red">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">0</div>
          <div className="text-sm text-gray-600 font-unbounded-regular">Избранное</div>
          <div className="text-xs text-yellow-600 mt-2 font-unbounded-medium">Сохранено событий</div>
        </div>

        <div className="stat-card yellow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">0</div>
          <div className="text-sm text-gray-600 font-unbounded-regular">Отзывов</div>
          <div className="text-xs text-purple-600 mt-2 font-unbounded-medium">Средняя оценка: 5.0</div>
        </div>
      </div>

      {/* Activity Counter - Mobile Only */}
      <ActivityCounter />

      {/* Quick Actions */}
      <div className="profile-card p-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-2xl font-unbounded-bold text-gray-900 mb-6">Быстрые действия</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/profile/children"
            className="profile-card-interactive p-6 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-unbounded-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Добавить ребенка
                </h4>
                <p className="text-sm text-gray-600 font-unbounded-regular">Укажите данные ваших детей</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/favorites"
            className="profile-card-interactive p-6 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-unbounded-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  Избранное
                </h4>
                <p className="text-sm text-gray-600 font-unbounded-regular">Сохраненные события</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/points"
            className="profile-card-interactive p-6 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-unbounded-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  Мои баллы
                </h4>
                <p className="text-sm text-gray-600 font-unbounded-regular">Управление бонусами</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}