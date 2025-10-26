'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  MapPin, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Bell,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveButton from './ResponsiveForm';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

interface VendorDashboardMobileProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function VendorDashboardMobile({
  children,
  currentPage = 'dashboard',
  onPageChange
}: VendorDashboardMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();
  const { isOnline, queueLength } = useBackgroundSync();

  const menuItems = [
    { id: 'dashboard', label: 'Панель управления', icon: Home, href: '/vendor/dashboard' },
    { id: 'events', label: 'События', icon: Calendar, href: '/vendor/events' },
    { id: 'venues', label: 'Места', icon: MapPin, href: '/vendor/venues' },
    { id: 'customers', label: 'Клиенты', icon: Users, href: '/vendor/customers' },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, href: '/vendor/analytics' },
    { id: 'settings', label: 'Настройки', icon: Settings, href: '/vendor/settings' }
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
            <h1 className="text-lg font-semibold text-gray-900">Vendor Dashboard</h1>
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
              {queueLength > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {queueLength}
                </span>
              )}
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
            <div className="flex items-center text-yellow-800 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              Вы не в сети. Изменения будут синхронизированы при подключении.
            </div>
          </div>
        )}
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
        title="Меню"
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
                <span>Создать событие</span>
              </button>
              <button className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 mr-3" />
                <span>Добавить место</span>
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {queueLength > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Ожидает синхронизации: {queueLength} элементов</span>
              </div>
            </div>
          )}
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
              placeholder="Поиск событий, мест, клиентов..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                События
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                Места
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                Клиенты
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
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Период
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <div className="space-y-2">
                {['Все', 'Активные', 'Завершенные', 'Отмененные'].map((status) => (
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
            {/* Sync Status */}
            {queueLength > 0 && (
              <ResponsiveCard variant="filled" className="border-l-4 border-l-yellow-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Ожидает синхронизации
                    </p>
                    <p className="text-xs text-gray-600">
                      {queueLength} элементов будут синхронизированы при подключении к интернету
                    </p>
                  </div>
                </div>
              </ResponsiveCard>
            )}

            {/* Recent Notifications */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Последние уведомления</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">Новый заказ #12345</p>
                  <p className="text-xs text-gray-500">2 часа назад</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">Событие "Детский день" одобрено</p>
                  <p className="text-xs text-gray-500">5 часов назад</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
}
