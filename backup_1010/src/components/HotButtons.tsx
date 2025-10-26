'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Theater, MapPin, Users, Star } from 'lucide-react'

interface HotButton {
  id: string
  title: string
  description: string
  icon: string
  color: string
  clicks: number
  isActive: boolean
}

interface HotButtonsProps {
  onButtonClick?: (button: HotButton) => void
}

export default function HotButtons({ onButtonClick }: HotButtonsProps) {
  const [hotButtons, setHotButtons] = useState<HotButton[]>([
    {
      id: 'regular-events',
      title: 'Постоянные мероприятия',
      description: 'Мастер-классы, кружки, регулярные занятия',
      icon: 'calendar',
      color: 'blue',
      clicks: 0,
      isActive: false
    },
    {
      id: 'city-events',
      title: 'События нашего города',
      description: 'Местные мероприятия и активности',
      icon: 'map-pin',
      color: 'green',
      clicks: 0,
      isActive: false
    },
    {
      id: 'theater',
      title: 'Театральные представления',
      description: 'Спектакли, мюзиклы, детские постановки',
      icon: 'theater',
      color: 'purple',
      clicks: 0,
      isActive: false
    }
  ])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar className="w-5 h-5" />
      case 'map-pin':
        return <MapPin className="w-5 h-5" />
      case 'theater':
        return <Theater className="w-5 h-5" />
      case 'users':
        return <Users className="w-5 h-5" />
      case 'star':
        return <Star className="w-5 h-5" />
      default:
        return <TrendingUp className="w-5 h-5" />
    }
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const baseClasses = 'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 border-2'
    
    if (isActive) {
      switch (color) {
        case 'blue':
          return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300 shadow-md`
        case 'green':
          return `${baseClasses} bg-green-100 text-green-800 border-green-300 shadow-md`
        case 'purple':
          return `${baseClasses} bg-purple-100 text-purple-800 border-purple-300 shadow-md`
        case 'orange':
          return `${baseClasses} bg-orange-100 text-orange-800 border-orange-300 shadow-md`
        case 'pink':
          return `${baseClasses} bg-pink-100 text-pink-800 border-pink-300 shadow-md`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300 shadow-md`
      }
    } else {
      return `${baseClasses} bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md`
    }
  }

  const handleButtonClick = (button: HotButton) => {
    // Обновляем состояние кнопки
    setHotButtons(prev => prev.map(b => 
      b.id === button.id 
        ? { ...b, isActive: !b.isActive, clicks: b.clicks + 1 }
        : { ...b, isActive: false }
    ))

    // Отправляем данные для ИИ-аналитики
    console.log('Hot button clicked:', {
      id: button.id,
      title: button.title,
      clicks: button.clicks + 1,
      timestamp: new Date().toISOString()
    })

    // Вызываем callback
    onButtonClick?.(button)
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Популярные категории</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {hotButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button)}
              className={getColorClasses(button.color, button.isActive)}
            >
              <div className="flex items-center gap-2">
                {getIcon(button.icon)}
                <div className="text-left">
                  <div className="font-semibold">{button.title}</div>
                  <div className="text-xs opacity-75">{button.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Счетчик кликов для админа (скрытый от клиентов) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 text-xs text-gray-500 opacity-0 pointer-events-none">
            Клики: {hotButtons.map(b => `${b.title}: ${b.clicks}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
