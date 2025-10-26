// src/components/AfishaSort.tsx
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function AfishaSort() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const value = sp.get('sort') ?? 'new'

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(sp.toString())
    next.set('sort', e.target.value)
    next.delete('page') // при смене сортировки — на первую страницу
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="text-sm">
      <label className="mr-2 text-gray-500">Сортировка:</label>
      <select
        value={value}
        onChange={onChange}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5"
      >
        <option value="new">по новизне</option>
        <option value="date_asc">по дате (раньше)</option>
        <option value="price_asc">сначала дешевле</option>
        <option value="price_desc">сначала дороже</option>
      </select>
    </div>
  )
}