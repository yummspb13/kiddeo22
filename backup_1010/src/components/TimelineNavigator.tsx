'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TimelineNavigatorProps {
  onDateChange?: (date: string | null) => void
  initialDate?: string | null
  selectedDate?: string | null
}

export default function TimelineNavigator({ 
  onDateChange, 
  initialDate,
  selectedDate: externalSelectedDate
}: TimelineNavigatorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null)
  const [dates, setDates] = useState<Date[]>([])

  // Синхронизируем с внешним состоянием
  useEffect(() => {
    if (externalSelectedDate !== undefined) {
      setSelectedDate(externalSelectedDate)
    }
  }, [externalSelectedDate])

  // Генерируем даты для таймлайна (сегодня + 30 дней вперед)
  useEffect(() => {
    const today = new Date()
    today.setHours(0,0,0,0)
    const newDates: Date[] = []
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      newDates.push(date)
    }
    
    setDates(newDates)
  }, [])

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    if (isToday) return 'Сегодня'
    if (isTomorrow) return 'Завтра'
    
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const monthNames = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ]
    
    const dayName = dayNames[date.getDay()]
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    
    return `${dayName} ${day} ${month}`
  }

  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleDateClick = (date: Date | null) => {
    const dateString = date ? toLocalYMD(date) : null
    setSelectedDate(dateString)
    onDateChange?.(dateString)
  }

  const scrollToSelected = () => {
    const selectedElement = document.getElementById(`timeline-date-${selectedDate}`)
    if (selectedElement) {
      selectedElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center'
      })
    }
  }

  // Прокручиваем к выбранной дате при загрузке
  useEffect(() => {
    const timer = setTimeout(scrollToSelected, 100)
    return () => clearTimeout(timer)
  }, [selectedDate])

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          {/* Кнопки прокрутки */}
          <button
            onClick={() => {
              const container = document.getElementById('timeline-container')
              if (container) {
                container.scrollBy({ left: -200, behavior: 'smooth' })
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => {
              const container = document.getElementById('timeline-container')
              if (container) {
                container.scrollBy({ left: 200, behavior: 'smooth' })
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Контейнер с датами */}
          <div className="relative">
            {/* Градиентная маска слева */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none"></div>
            
            {/* Градиентная маска справа */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-indigo-50 to-transparent z-10 pointer-events-none"></div>
            
            <div
              id="timeline-container"
              className="flex gap-3 overflow-x-auto scrollbar-hide px-12 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            {/* Кнопка "Все события" */}
            <button
              onClick={() => handleDateClick(null)}
              className={`
                flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                ${selectedDate === null
                  ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }
              `}
            >
              <div className="text-center min-w-[100px]">
                <div className={`font-bold ${selectedDate === null ? 'text-green-800' : 'text-gray-900'}`}>
                  Все события
                </div>
                {/* Убрали мигающую точку для "Все события" */}
              </div>
            </button>

            {dates.map((date) => {
              const dateString = toLocalYMD(date)
              const isSelected = selectedDate === dateString
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <button
                  key={dateString}
                  id={`timeline-date-${dateString}`}
                  onClick={() => handleDateClick(date)}
                  className={`
                    flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                    ${isSelected 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                    }
                    ${isToday && !isSelected 
                      ? 'ring-2 ring-blue-400 bg-blue-50 border-2 border-blue-200' 
                      : ''
                    }
                  `}
                >
                  <div className="text-center min-w-[80px]">
                    <div className={`font-bold ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                      {formatDate(date)}
                    </div>
                    {/* Время для Сегодня скрываем */}
                    {/* Убрали мигающую точку для выбранных дат */}
                  </div>
                </button>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
