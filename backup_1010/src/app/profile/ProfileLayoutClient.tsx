"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { usePoints } from '@/hooks/usePoints'
import { User, Users, Heart, Star, MessageSquare, Bell, Settings, Gift, ShoppingBag, FileText, Crown, Sparkles, Zap, Building2 } from "lucide-react"
import PointsTips from '@/components/PointsTips'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-unbounded'
})

interface ProfileLayoutClientProps {
  children: React.ReactNode
}

export default function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: pointsData } = usePoints()

  const menuItems = [
    { id: "overview", label: "Обзор", icon: User, href: "/profile", color: "blue" },
    { id: "children", label: "Мои дети", icon: Users, count: 0, href: "/profile/children", color: "green" },
    { id: "orders", label: "Мои заказы", icon: ShoppingBag, count: 0, href: "/profile/orders", color: "purple" },
    { id: "favorites", label: "Избранное", icon: Heart, count: 0, href: "/profile/favorites", color: "red" },
    { id: "reviews", label: "Отзывы", icon: Star, count: 0, href: "/profile/reviews", color: "yellow" },
    { id: "comments", label: "Комментарии", icon: MessageSquare, count: 0, href: "/profile/comments", color: "blue" },
    { id: "points", label: "Баллы", icon: Gift, count: 0, href: "/profile/points", color: "orange" },
    { id: "notifications", label: "Уведомления", icon: Bell, count: 0, href: "/profile/notifications", color: "purple" },
    { id: "settings", label: "Настройки", icon: Settings, href: "/profile/settings", color: "gray" },
  ]

  const getActiveTab = () => {
    if (pathname === "/profile") return "overview"
    return pathname.split("/").pop() || "overview"
  }

  const activeTab = getActiveTab()

  const getLevelInfo = (points: number) => {
    if (points >= 1000) return { level: 'PLATINUM', icon: Crown, color: 'text-yellow-600', bg: 'bg-gradient-to-r from-yellow-400 to-orange-500' }
    if (points >= 500) return { level: 'VIP', icon: Sparkles, color: 'text-purple-600', bg: 'bg-gradient-to-r from-purple-400 to-pink-500' }
    if (points >= 100) return { level: 'ACTIVE', icon: Zap, color: 'text-blue-600', bg: 'bg-gradient-to-r from-blue-400 to-cyan-500' }
    return { level: 'NOVICE', icon: Gift, color: 'text-gray-600', bg: 'bg-gradient-to-r from-gray-400 to-gray-500' }
  }

  const levelInfo = getLevelInfo(pointsData?.userPoints?.points || 0)
  const LevelIcon = levelInfo.icon

  return (
    <div className={`profile-container ${unbounded.variable}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="profile-card p-8 mb-8 animate-fadeInUp">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Аватар с анимацией */}
            <div className="relative">
              <div className="profile-avatar animate-float">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt="Аватар" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0) || user.email?.charAt(0) || "U"
                )}
              </div>
              {/* Индикатор уровня */}
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${levelInfo.bg} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-glow`}>
                <LevelIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Информация о пользователе */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-unbounded-bold text-gradient mb-2">
                    {user.name || "Пользователь"}
                  </h1>
                  <p className="text-gray-600 text-lg font-unbounded-regular mb-4">{user.email}</p>
                  
                  {/* Статистика */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500 font-unbounded-regular">Участник с 2024</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-yellow-600" />
                      <span className="text-lg font-unbounded-bold text-yellow-600">
                        {pointsData?.userPoints?.points || 0} баллов
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LevelIcon className={`w-5 h-5 ${levelInfo.color}`} />
                      <span className={`text-sm font-unbounded-medium ${levelInfo.color}`}>
                        {levelInfo.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Быстрые действия */}
                <div className="mt-4 lg:mt-0 flex space-x-3">
                  <Link 
                    href="/vendor-register"
                    className="btn-secondary font-unbounded-medium inline-flex items-center"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Зарегистрировать компанию
                  </Link>
                  <button className="btn-primary font-unbounded-medium inline-flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="profile-nav animate-fadeInLeft">
              <ul>
                {menuItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`profile-nav-item ${isActive ? 'active' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          isActive 
                            ? 'bg-white/20' 
                            : `bg-${item.color}-100 text-${item.color}-600`
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="flex-1 font-unbounded-medium">{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse font-unbounded-bold">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="animate-fadeInRight">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Компонент подсказок о баллах */}
      <PointsTips />
    </div>
  )
}
