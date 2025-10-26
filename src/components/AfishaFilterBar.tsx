'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function AfishaFilterBar() {
  const pathname = usePathname()
  const sp = useSearchParams()
  const router = useRouter()

  const [q, setQ] = useState(sp.get('q') ?? '')
  const [priceMin, setPriceMin] = useState(sp.get('priceMin') ?? '')
  const [priceMax, setPriceMax] = useState(sp.get('priceMax') ?? '')
  const [dateFrom, setDateFrom] = useState(sp.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(sp.get('dateTo') ?? '')
  const [free, setFree] = useState(sp.get('free') === '1')
  const [ageMin, setAgeMin] = useState(sp.get('ageMin') ?? '')
  const [ageMax, setAgeMax] = useState(sp.get('ageMax') ?? '')

  const apply = () => {
    const next = new URLSearchParams(sp.toString())

    function put(name: string, v: string) {
      if (v && v.trim()) next.set(name, v.trim())
      else next.delete(name)
    }
    put('q', q)
    put('priceMin', priceMin)
    put('priceMax', priceMax)
    put('dateFrom', dateFrom)
    put('dateTo', dateTo)
    put('ageMin', ageMin)
    put('ageMax', ageMax)

    if (free) next.set('free', '1')
    else next.delete('free')

    // при изменении фильтров сбрасываем пагинацию
    next.delete('page')

    router.push(`${pathname}?${next.toString()}`)
  }

  const clear = () => {
    const next = new URLSearchParams(sp.toString())
    ;['q','priceMin','priceMax','dateFrom','dateTo','free','ageMin','ageMax','page'].forEach(k => next.delete(k))
    router.push(`${pathname}?${next.toString()}`)
  }

  // пресеты возраста для быстрого выбора
  const presets = useMemo(() => ([
    { label: 'Любой', min: '', max: '' },
    { label: '0–3',  min: '0',  max: '3' },
    { label: '4–7',  min: '4',  max: '7' },
    { label: '8–12', min: '8',  max: '12' },
    { label: '13–16',min: '13', max: '16' },
  ]), [])

  return (
    <div className="rounded-2xl border bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        {/* 1-я строка: поиск + бесплатно + кнопки */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию и описанию"
            className="flex-1 rounded-md border px-3 py-2"
          />
          <label className="inline-flex items-center gap-2 select-none">
            <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} className="h-4 w-4"/>
            Бесплатно
          </label>
          <div className="ms-auto flex gap-2">
            <button onClick={apply} className="px-3 py-2 rounded-md bg-black text-white">Применить</button>
            <button onClick={clear} className="px-3 py-2 rounded-md border">Сбросить</button>
          </div>
        </div>

        {/* 2-я строка: цена + даты */}
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">Цена, ₽</span>
            <input value={priceMin} onChange={(e)=>setPriceMin(e.target.value)} inputMode="numeric" placeholder="от"
                   className="w-full rounded-md border px-3 py-2"/>
            <input value={priceMax} onChange={(e)=>setPriceMax(e.target.value)} inputMode="numeric" placeholder="до"
                   className="w-full rounded-md border px-3 py-2"/>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="text-sm text-gray-500 shrink-0">Даты</span>
            <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)}
                   className="w-full rounded-md border px-3 py-2"/>
            <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)}
                   className="w-full rounded-md border px-3 py-2"/>
          </div>

          {/* Возраст */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">Возраст</span>
            <input value={ageMin} onChange={(e)=>setAgeMin(e.target.value)} inputMode="numeric" placeholder="от"
                   className="w-full rounded-md border px-3 py-2"/>
            <input value={ageMax} onChange={(e)=>setAgeMax(e.target.value)} inputMode="numeric" placeholder="до"
                   className="w-full rounded-md border px-3 py-2"/>
          </div>
        </div>

        {/* быстрые пресеты возраста */}
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => { setAgeMin(p.min); setAgeMax(p.max); }}
              className="px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 text-sm"
              type="button"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}