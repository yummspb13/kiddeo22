"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FileText, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Users,
  MapPin,
  Layout
} from "lucide-react"

export default function ContentNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      href: "/content",
      icon: FileText,
      label: "Главная",
      description: "Обзор контента"
    },
    {
      href: "/content/new",
      icon: Plus,
      label: "Создать",
      description: "Новый контент"
    },
    {
      href: "/content/plans",
      icon: Calendar,
      label: "Планы",
      description: "Публикации"
    },
    {
      href: "/content/analytics",
      icon: BarChart3,
      label: "Аналитика",
      description: "Метрики"
    },
    {
      href: "/content/settings",
      icon: Settings,
      label: "Настройки",
      description: "Команда и роли"
    }
  ]

  const contentTypes = [
    {
      href: "/content/new?type=ARTICLE",
      icon: FileText,
      label: "Статья",
      color: "text-blue-600"
    },
    {
      href: "/content/new?type=COLLECTION",
      icon: Users,
      label: "Подборка",
      color: "text-green-600"
    },
    {
      href: "/content/new?type=SPECIAL_PROJECT",
      icon: BarChart3,
      label: "Спецпроект",
      color: "text-purple-600"
    },
    {
      href: "/content/new?type=HERO_CITY",
      icon: MapPin,
      label: "Хиро в городе",
      color: "text-orange-600"
    },
    {
      href: "/content/new?type=LAYOUT",
      icon: Layout,
      label: "Лайаут",
      color: "text-gray-600"
    }
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/content" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Контент</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Quick Create Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Создать</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {contentTypes.map((type) => (
                    <Link
                      key={type.href}
                      href={type.href}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span>{type.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/content" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Контент</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 py-4">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick Create Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Быстрое создание
                </h3>
                <div className="space-y-1">
                  {contentTypes.map((type) => (
                    <Link
                      key={type.href}
                      href={type.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span>{type.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
