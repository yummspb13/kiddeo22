'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import TimelineNavigator from './TimelineNavigator'
import HotButtons from './HotButtons'
import ExpandableFilters from './ExpandableFilters'

interface AfishaWithTimelineProps {
  children: React.ReactNode
}

export default function AfishaWithTimeline({ children }: AfishaWithTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filters, setFilters] = useState<any>({})
  const router = useRouter()
  const sp = useSearchParams()
  const pathname = usePathname()

  // Синхронизируем выбранную дату с URL (если dateFrom и dateTo одинаковые)
  useEffect(() => {
    const df = sp.get('dateFrom')
    const dt = sp.get('dateTo')
    if (df && dt && df === dt) {
      setSelectedDate(df)
    } else if (!df && !dt) {
      setSelectedDate(null)
    }
  }, [sp])

  // При смене города/маршрута — очищаем дату в URL и локальном состоянии
  useEffect(() => {
    const params = new URLSearchParams(sp.toString())
    if (params.has('dateFrom') || params.has('dateTo')) {
      params.delete('dateFrom')
      params.delete('dateTo')
      setSelectedDate(null)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleDateChange = (date: string | null) => {
    setSelectedDate(date)
    // Синхронизируем URL: один день => обе границы на этот день, иначе очищаем
    const next = new URLSearchParams(sp.toString())
    if (date) {
      next.set('dateFrom', date)
      next.set('dateTo', date)
    } else {
      next.delete('dateFrom')
      next.delete('dateTo')
    }
    next.delete('page')
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const handleFilterChange = (newFilters: unknown) => {
    setFilters(newFilters)
    // Здесь можно добавить логику для обновления URL или фильтрации событий
    console.log('Filters changed:', newFilters)
  }

  const handleHotButtonClick = (button: unknown) => {
    const next = new URLSearchParams(sp.toString())
    // popular tag id comes from HotButtons ids
    next.set('popular', (button as any).id)
    next.delete('page')
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <>
      {/* Таймлайн-навигатор */}
      <TimelineNavigator 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Горячие кнопки */}
      <HotButtons onButtonClick={handleHotButtonClick} />

      {/* Расширенные фильтры */}
      <ExpandableFilters 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onFilterChange={handleFilterChange}
      />

      {/* Контент */}
      {children}
    </>
  )
}
