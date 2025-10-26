'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  value?: string // yyyy-mm-dd
  onChange: (v: string | null) => void
  anchorClassName?: string
  placeholder?: string
}

function toISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function CalendarPopover({ value, onChange, anchorClassName, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value) : new Date()
    base.setHours(0,0,0,0)
    return base
  })

  const selectedISO = value
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const monthMatrix = useMemo(() => {
    const first = new Date(cursor)
    first.setDate(1)
    const startDay = (first.getDay() + 6) % 7 // 0..6, Mon=0
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor)
      date.setDate(d)
      cells.push(date)
    }
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null)
    const weeks: (Date | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }, [cursor])

  function pick(d: Date | null) {
    if (!d) return
    onChange(toISO(d))
    setOpen(false)
  }

  function clear() { onChange(null); setOpen(false) }
  function today() { const d = new Date(); d.setHours(0,0,0,0); onChange(toISO(d)); setOpen(false) }

  const monthsRu = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
  const weekRu = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

  function formatDDMMYYYY(iso?: string) {
    if (!iso) return 'дд.мм.гггг'
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={anchorClassName ?? 'w-[124px] rounded-md border px-3 py-2 text-left'}
      >
        {selectedISO ? formatDDMMYYYY(selectedISO) : (placeholder || 'дд.мм.гггг')}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[320px] rounded-xl border bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold capitalize">
              {monthsRu[cursor.getMonth()]} {cursor.getFullYear()} г.
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              {weekRu.map(w => (<div key={w} className="py-1">{w}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthMatrix.flat().map((cell, idx) => {
                if (!cell) return <div key={idx} className="h-9" />
                const iso = toISO(cell)
                const selected = iso === selectedISO
                const isToday = iso === toISO(new Date())
                return (
                  <button
                    key={idx}
                    onClick={() => pick(cell)}
                    className={`h-9 rounded-md text-sm transition ${selected ? 'bg-blue-600 text-white' : isToday ? 'ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
                  >
                    {cell.getDate()}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-blue-700 px-1 pt-3">
              <button type="button" onClick={clear} className="hover:underline">Удалить</button>
              <button type="button" onClick={today} className="hover:underline">Сегодня</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


