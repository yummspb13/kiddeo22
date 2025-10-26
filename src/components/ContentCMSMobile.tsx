'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Image, 
  Video, 
  BarChart3, 
  Settings, 
  Plus,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Upload,
  Download,
  Share,
  Copy
} from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveButton from './ResponsiveForm';
import ResponsiveModal, { ConfirmationModal } from './ResponsiveModal';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface ContentCMSMobileProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function ContentCMSMobile({
  children,
  currentPage = 'dashboard',
  onPageChange
}: ContentCMSMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Панель управления', icon: Home, href: '/cms/dashboard' },
    { id: 'content', label: 'Контент', icon: FileText, href: '/cms/content' },
    { id: 'media', label: 'Медиа', icon: Image, href: '/cms/media' },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, href: '/cms/analytics' },
    { id: 'settings', label: 'Настройки', icon: Settings, href: '/cms/settings' }
  ];

  const handlePageChange = (page: string) => {
    onPageChange?.(page);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo/Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Content CMS</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
        <div className="flex justify-around h-16">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 text-xs font-medium transition-colors min-h-touch ${
                  isActive ? 'text-red-600' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Content CMS"
        position="left"
        size="md"
      >
        <div className="p-4 space-y-6">
          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Разделы</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Быстрые действия</h3>
            <div className="space-y-2">
              <button className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 mr-3" />
                <span>Создать статью</span>
              </button>
              <button className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 mr-3" />
                <span>Загрузить медиа</span>
              </button>
            </div>
          </div>

          {/* Content Status */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Опубликовано: 15 статей</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Черновики: 3 статьи</span>
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Search Drawer */}
      <MobileDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Поиск"
        position="top"
        size="sm"
      >
        <div className="p-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Поиск статей, медиа, тегов..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                Статьи
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                Медиа
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                Теги
              </button>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Filter Drawer */}
      <MobileDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Фильтры"
        position="bottom"
        size="md"
      >
        <div className="p-4">
          <div className="space-y-6">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип контента
              </label>
              <div className="space-y-2">
                {['Все', 'Статьи', 'Медиа', 'Страницы'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value={type}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <div className="space-y-2">
                {['Все', 'Опубликовано', 'Черновик', 'На модерации'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Filters */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Сбросить
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Notifications Drawer */}
      <MobileDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Уведомления"
        position="right"
        size="md"
      >
        <div className="p-4">
          <div className="space-y-4">
            {/* Content Status */}
            <ResponsiveCard variant="filled" className="border-l-4 border-l-green-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Контент обновлен
                  </p>
                  <p className="text-xs text-gray-600">
                    Все изменения сохранены
                  </p>
                </div>
              </div>
            </ResponsiveCard>

            {/* Recent Notifications */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Последние уведомления</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-900">Статья опубликована</p>
                    <span className="text-xs text-gray-500">10 мин назад</span>
                  </div>
                  <p className="text-xs text-gray-600">"Как выбрать детское мероприятие"</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-900">Медиа загружено</p>
                    <span className="text-xs text-gray-500">1 час назад</span>
                  </div>
                  <p className="text-xs text-gray-600">5 изображений добавлено в галерею</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-900">Черновик сохранен</p>
                    <span className="text-xs text-gray-500">2 часа назад</span>
                  </div>
                  <p className="text-xs text-gray-600">"Летние активности для детей"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
}
