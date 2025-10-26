"use client"

import { useState, useEffect, useRef } from 'react'
import { Gift, Star, MessageSquare, ShoppingBag, Users, Calendar, Info, CheckCircle, X } from 'lucide-react'

interface PointsTip {
  id: string
  title: string
  description: string
  points: number
  icon: React.ComponentType<{ className?: string }>
  category: 'review' | 'purchase' | 'social' | 'profile' | 'bonus'
  completed?: boolean
}

const pointsTips: PointsTip[] = [
  {
    id: 'write_review',
    title: 'Написать отзыв',
    description: 'Оставьте отзыв о посещенном месте или событии',
    points: 10,
    icon: MessageSquare,
    category: 'review'
  },
  {
    id: 'rate_venue',
    title: 'Оценить место',
    description: 'Поставьте оценку месту или событию',
    points: 5,
    icon: Star,
    category: 'review'
  },
  {
    id: 'buy_tickets',
    title: 'Купить билеты',
    description: 'Покупайте билеты и получайте баллы за каждый рубль',
    points: 1,
    icon: ShoppingBag,
    category: 'purchase'
  },
  {
    id: 'add_child',
    title: 'Добавить ребенка',
    description: 'Добавьте информацию о вашем ребенке в профиль',
    points: 25,
    icon: Users,
    category: 'profile'
  },
  {
    id: 'complete_profile',
    title: 'Заполнить профиль',
    description: 'Полностью заполните информацию в профиле',
    points: 50,
    icon: Gift,
    category: 'profile'
  },
  {
    id: 'invite_friend',
    title: 'Пригласить друга',
    description: 'Пригласите друга и получите бонус при его регистрации',
    points: 200,
    icon: Users,
    category: 'social'
  },
  {
    id: 'birthday_bonus',
    title: 'День рождения ребенка',
    description: 'Получите бонус в день рождения вашего ребенка',
    points: 50,
    icon: Calendar,
    category: 'bonus'
  }
]

export default function PointsTips() {
  const [isOpen, setIsOpen] = useState(false)
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set())
  const modalRef = useRef<HTMLDivElement>(null)

  const handleTipComplete = (tipId: string) => {
    setCompletedTips(prev => new Set([...prev, tipId]))
  }

  // Обработчик клика вне модального окна и нажатия Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Блокируем скролл страницы когда модальное окно открыто
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'review': return 'text-blue-600 bg-blue-100'
      case 'purchase': return 'text-green-600 bg-green-100'
      case 'social': return 'text-purple-600 bg-purple-100'
      case 'profile': return 'text-orange-600 bg-orange-100'
      case 'bonus': return 'text-pink-600 bg-pink-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'review': return 'Отзывы'
      case 'purchase': return 'Покупки'
      case 'social': return 'Социальные'
      case 'profile': return 'Профиль'
      case 'bonus': return 'Бонусы'
      default: return 'Другие'
    }
  }

  const groupedTips = pointsTips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = []
    }
    acc[tip.category].push(tip)
    return acc
  }, {} as Record<string, PointsTip[]>)

  return (
    <>
      {/* Кнопка для открытия подсказок */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        title="Как получить баллы?"
      >
        <Gift className="w-6 h-6" />
      </button>

      {/* Модальное окно с подсказками - оптимизировано под мобильные */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl md:w-auto max-h-[90vh] md:max-h-[80vh] overflow-hidden shadow-2xl transform transition-transform duration-300 ease-out"
          >
            {/* Заголовок - компактный в стиле Тинькофф */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold">Как получить баллы</h2>
                    <p className="text-blue-100 text-sm">Выполняйте действия и зарабатывайте</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Содержимое - компактные карточки */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-8rem)] md:max-h-[calc(80vh-10rem)]">
              {Object.entries(groupedTips).map(([category, tips]) => (
                <div key={category} className="mb-6">
                  <div className="flex items-center mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                      {getCategoryName(category)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {tips.map((tip) => {
                      const Icon = tip.icon
                      const isCompleted = completedTips.has(tip.id)
                      
                      return (
                        <div
                          key={tip.id}
                          className={`border rounded-xl p-3 transition-all duration-200 ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isCompleted ? 'text-green-600' : 'text-gray-600'
                              }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm truncate ${
                                  isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                                }`}>
                                  {tip.title}
                                </h4>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  isCompleted ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                                }`}>
                                  +{tip.points}
                                </span>
                              </div>
                              
                              <p className={`text-xs mb-2 line-clamp-2 ${
                                isCompleted ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {tip.description}
                              </p>
                              
                              {!isCompleted && (
                                <button
                                  onClick={() => handleTipComplete(tip.id)}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Отметить</span>
                                </button>
                              )}
                              
                              {isCompleted && (
                                <div className="flex items-center space-x-1 text-green-600 text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Выполнено</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Подвал - компактный */}
            <div className="bg-gray-50 px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Info className="w-3 h-3" />
                  <span className="hidden md:inline">Баллы начисляются автоматически</span>
                  <span className="md:hidden">Автоматическое начисление</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
