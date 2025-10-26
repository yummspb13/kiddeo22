"use client"

import { useState, useEffect } from "react"
import { useAdminNotifications } from "@/hooks/useAdminNotifications"
import Badge from "@/components/ui/Badge"
import HydrationBoundary from "@/components/HydrationBoundary"

interface NotificationDropdownProps {
  keySuffix: string
  adminKey?: string
}

export default function NotificationDropdown({ keySuffix, adminKey }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { counts, loading } = useAdminNotifications(adminKey)

  const totalNotifications = counts.users + counts.vendors + counts.leads + counts.vendorApprovals

  // Fallback для состояния загрузки
  const loadingFallback = (
    <div className="relative">
      <button className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
        </svg>
        <span>Уведомления</span>
      </button>
    </div>
  )

  if (loading) {
    return <HydrationBoundary fallback={loadingFallback}>{loadingFallback}</HydrationBoundary>
  }

  return (
    <HydrationBoundary>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 flex items-center gap-2 relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
          </svg>
          <span>Уведомления</span>
          {totalNotifications > 0 && (
            <Badge 
              count={totalNotifications} 
              variant="destructive"
              size="sm"
              className="ml-1"
            />
          )}
        </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              <p className="text-sm text-gray-500">Новые события в системе</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {totalNotifications === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="divide-y">
                  {counts.users > 0 && (
                    <a 
                      href={`/admin/users${keySuffix}`}
                      className="block p-4 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Новые пользователи</p>
                          <p className="text-sm text-gray-500">Зарегистрировалось {counts.users} новых пользователей</p>
                        </div>
                        <Badge count={counts.users} variant="default" />
                      </div>
                    </a>
                  )}
                  
                  {counts.vendors > 0 && (
                    <a 
                      href={`/admin/vendors${keySuffix}`}
                      className="block p-4 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Новые вендоры</p>
                          <p className="text-sm text-gray-500">Зарегистрировалось {counts.vendors} новых вендоров</p>
                        </div>
                        <Badge count={counts.vendors} variant="default" />
                      </div>
                    </a>
                  )}
                  
                  {counts.vendorApprovals > 0 && (
                    <a 
                      href={`/admin/vendors${keySuffix}`}
                      className="block p-4 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Требуют одобрения</p>
                          <p className="text-sm text-gray-500">{counts.vendorApprovals} вендоров ждут активации</p>
                        </div>
                        <Badge count={counts.vendorApprovals} variant="warning" />
                      </div>
                    </a>
                  )}
                  
                  {counts.leads > 0 && (
                    <a 
                      href={`/admin/leads${keySuffix}`}
                      className="block p-4 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Новые лиды</p>
                          <p className="text-sm text-gray-500">Поступило {counts.leads} новых заявок</p>
                        </div>
                        <Badge count={counts.leads} variant="destructive" />
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {totalNotifications > 0 && (
              <div className="p-4 border-t">
                <a 
                  href={`/admin/notifications${keySuffix}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  Посмотреть все уведомления →
                </a>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </HydrationBoundary>
  )
}
