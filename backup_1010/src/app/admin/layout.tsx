// src/app/admin/layout.tsx
"use client"

import type { ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminNotifications } from "@/hooks/useAdminNotifications"
import Badge from "@/components/ui/Badge"
import NotificationDropdown from "@/components/admin/NotificationDropdown"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const searchParams = useSearchParams()
  const key = searchParams.get('key')
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''
  const { counts } = useAdminNotifications(key || undefined)

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-6 font-unbounded">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold font-unbounded">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">Управление маркетплейсом афиши</p>
        </div>
        <nav className="flex gap-3 items-center">
          <a 
            href={`/admin/dashboard${keySuffix}`} 
            className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            В админ-панель
          </a>
          <NotificationDropdown keySuffix={keySuffix} adminKey={key || undefined} />
        </nav>
      </header>
      {children}
    </div>
  )
}
