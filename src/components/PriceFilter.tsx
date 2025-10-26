"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { priceBuckets } from "@/config/afishaFilters"

export default function PriceFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = new Set((searchParams.get("price") || "").split(",").filter(Boolean))

  const toggle = (slug: string) => {
    const next = new Set(selected)
    if (next.has(slug)) next.delete(slug); else next.add(slug)

    const params = new URLSearchParams(searchParams.toString())
    if (next.size) params.set("price", Array.from(next).join(","))
    else params.delete("price")

    // НЕ сбрасываем пагинацию для фильтра по цене
    params.delete("quickFilter")

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Цена</h3>
      <div className="flex flex-wrap gap-2">
        {priceBuckets.map(b => {
          const active = selected.has(b.slug)
          return (
            <button
              key={b.slug}
              onClick={() => toggle(b.slug)}
              className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
                active ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {b.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
