"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { usePoints } from '@/hooks/usePoints'
import { User, Users, Heart, Star, MessageSquare, Bell, Settings, Gift, ShoppingBag, FileText, Crown, Sparkles, Zap, Building2 } from "@/lib/icons"
import PointsTips from '@/components/PointsTips'
import InviteFriendButton from '@/components/InviteFriendButton'
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
  const { user, refetch } = useAuth()
  const { data: pointsData } = usePoints()
  
  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Обновляем данные пользователя только при изменении URL (переход между страницами)
  useEffect(() => {
    if (refetch) {
      refetch()
    }
  }, [pathname]) // Убираем refetch из зависимостей

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="profile-header-mobile block md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="profile-avatar-mobile">
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
                <div className="profile-level-mobile">
                  <LevelIcon className="w-3 h-3" />
                </div>
              </div>
              <div>
                <h1 className="profile-text-xl-mobile profile-font-semibold-mobile">{user.name || "Пользователь"}</h1>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="profile-nav-mobile block md:hidden">
          <ul className="profile-nav-list-mobile">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`profile-nav-item-mobile ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="profile-nav-icon" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="profile-overlay-mobile open"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`profile-drawer-mobile ${isMobileMenuOpen ? 'open' : ''} md:hidden`}>
          <div className="profile-drawer-header-mobile">
            <h3 className="profile-drawer-title-mobile">Меню профиля</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="profile-drawer-close-mobile"
            >
              ×
            </button>
          </div>
          <nav className="profile-drawer-nav-mobile">
            <ul>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`profile-drawer-item-mobile ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="profile-drawer-icon-mobile" />
                      <span>{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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

        {/* Mobile Content */}
        <div className="profile-content-mobile block md:hidden">
          {children}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
        {/* Header */}
          <div className="profile-card p-4 sm:p-8 mb-6 sm:mb-8 animate-fadeInUp">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Блок 1: Аватар с анимацией */}
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

            {/* Блок 2: Информация о пользователе */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-unbounded-bold text-gradient mb-2">
                {user.name || "Пользователь"}
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-unbounded-regular mb-4">{user.email}</p>
              
              {/* Статистика */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500 font-unbounded-regular">
                      Участник с {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                    </span>
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
                <div className="text-left sm:text-right">
                  <Link 
                    href="/vendor/onboarding"
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 font-unbounded-regular"
                  >
                    Зарегистрировать компанию
                  </Link>
                </div>
              </div>
            </div>

            {/* Блок 3: Кнопка "Пригласить друга" в правом нижнем углу */}
            <div className="relative flex-shrink-0">
              <div className="absolute bottom-0 right-0">
                <InviteFriendButton />
              </div>
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
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
      </div>
      
      {/* Компонент подсказок о баллах */}
      <PointsTips />
    </div>
  )
}
