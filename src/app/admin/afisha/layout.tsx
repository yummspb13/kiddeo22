// src/app/admin/afisha/layout.tsx
"use client"

import type { ReactNode } from "react"
import { useSearchParams } from "next/navigation"

export default function AfishaAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const searchParams = useSearchParams()
  const key = searchParams?.get('key')
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Афиша — управление</h1>
          <p className="text-sm text-muted-foreground">Фильтры, модерация, рекламные слоты</p>
        </div>
        <nav className="flex gap-3">
          <a href={`/admin/afisha/filters${keySuffix}`} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50">
            Быстрые фильтры
          </a>
          <a href={`/admin/afisha/ads${keySuffix}`} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50">
            Рекламные слоты
          </a>
          <a href={`/admin/afisha/events${keySuffix}`} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50">
            Ивенты
          </a>
        </nav>
      </div>
      {children}
    </div>
  )
}
