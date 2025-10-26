'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Users, Star, Heart, Eye, Clock, MapPin, DollarSign, Sparkles, Zap, Target, Award, ArrowRight } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  coverImage?: string
  eventCount: number
  isPopular?: boolean
  isNew?: boolean
  isTrending?: boolean
  isPromoted?: boolean
  priority?: number
}

interface MobileCategoryCardsProps {
  categories: Category[]
  citySlug: string
}

interface HeroEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  coverImage?: string
  venue?: string
  isAd: boolean
  minPrice?: number
  slug?: string
}

export default function MobileCategoryCards({ categories, citySlug }: MobileCategoryCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set())
  const [heroEvent, setHeroEvent] = useState<HeroEvent | null>(null)
  const [isLoadingHero, setIsLoadingHero] = useState(true)
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  
  // Мемоизируем cityName
  const cityName = citySlug === 'moscow' || citySlug === 'moskva' ? 'Москва' : 
                   citySlug === 'spb' ? 'Санкт-Петербург' : citySlug

  // Загрузка рекламного мероприятия
  useEffect(() => {
    let isMounted = true
    
    const loadHeroEvent = async () => {
      if (!isMounted) return
      
      try {
        // Сначала пробуем загрузить рекламные слоты
        const response = await fetch(`/api/hero-slots?city=${encodeURIComponent(cityName)}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!isMounted) return
    
        if (data && data.events && data.events.length > 0) {
          if (data.slotId) {
            setCurrentSlotId(data.slotId)
          }
          
          const event = data.events[0]
          
          // Вычисляем минимальную цену из tickets
          let calculatedPrice = 0
          if (event.tickets) {
            try {
              const ticketsArray = typeof event.tickets === 'string' 
                ? JSON.parse(event.tickets) 
                : event.tickets
              
              if (Array.isArray(ticketsArray)) {
                const prices = ticketsArray
                  .filter(ticket => ticket.isActive && ticket.price > 0)
                  .map(ticket => ticket.price)
                
                if (prices.length > 0) {
                  calculatedPrice = Math.min(...prices)
                }
              }
            } catch (error) {
              console.error('Error parsing tickets:', error)
            }
          }
          
          setHeroEvent({
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            coverImage: event.coverImage,
            venue: event.venue,
            isAd: event.isAd || false,
            minPrice: calculatedPrice,
            slug: event.slug
          })
        } else {
          // Если рекламных слотов нет, загружаем случайное событие как fallback
          const fallbackResponse = await fetch(`/api/events/initial?city=${encodeURIComponent(cityName)}&limit=1`)
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            if (fallbackData.events && fallbackData.events.length > 0) {
              const event = fallbackData.events[0]
              
              // Вычисляем минимальную цену из tickets
              let calculatedPrice = 0
              if (event.tickets) {
                try {
                  const ticketsArray = typeof event.tickets === 'string' 
                    ? JSON.parse(event.tickets) 
                    : event.tickets
                  
                  if (Array.isArray(ticketsArray)) {
                    const prices = ticketsArray
                      .filter(ticket => ticket.isActive && ticket.price > 0)
                      .map(ticket => ticket.price)
                    
                    if (prices.length > 0) {
                      calculatedPrice = Math.min(...prices)
                    }
                  }
                } catch (error) {
                  console.error('Error parsing tickets:', error)
                }
              }
              
              setHeroEvent({
                id: event.id,
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                coverImage: event.coverImage,
                venue: event.venue,
                isAd: false, // Это не реклама
                minPrice: calculatedPrice,
                slug: event.slug
              })
            } else {
              console.log('❌ No fallback events found')
            }
          } else {
            const errorText = await fallbackResponse.text()
            console.error('❌ Fallback API error:', fallbackResponse.status, errorText)
          }
        }
      } catch (error) {
        console.error('❌ Error loading hero event:', error)
        
        // В случае ошибки тоже пробуем fallback
        try {
          console.log('🔄 Trying fallback after error...')
          console.log('📡 Error fallback URL:', `/api/events/initial?city=${encodeURIComponent(cityName)}&limit=1`)
          const fallbackResponse = await fetch(`/api/events/initial?city=${encodeURIComponent(cityName)}&limit=1`)
          
          console.log('📡 Error fallback response status:', fallbackResponse.status, 'OK:', fallbackResponse.ok)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            console.log('📡 Fallback after error:', fallbackData)
            if (fallbackData.events && fallbackData.events.length > 0) {
              const event = fallbackData.events[0]
              console.log('✅ Fallback event after error:', event.title)
              setHeroEvent({
                id: event.id,
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                coverImage: event.coverImage,
                venue: event.venue,
                isAd: false,
                minPrice: event.minPrice,
                slug: event.slug
              })
            }
          }
        } catch (fallbackError) {
          console.error('Error loading fallback event:', fallbackError)
        }
      } finally {
        setIsLoadingHero(false)
      }
    }

    // Загружаем сразу
    loadHeroEvent()
    
    return () => {
      isMounted = false
    }
  }, [cityName])

  const getCategoryIcon = (category: Category) => {
    // Если есть иконка из базы данных, используем её
    if (category.icon) {
      return <img src={category.icon} alt={category.name} className="w-8 h-8" />
    }
    
    // Иначе используем стандартные иконки
    const iconMap: { [key: string]: any } = {
      'театр': <Calendar className="w-8 h-8" />,
      'театры': <Calendar className="w-8 h-8" />,
      'спектакли': <Calendar className="w-8 h-8" />,
      'музей': <Target className="w-8 h-8" />,
      'музеи': <Target className="w-8 h-8" />,
      'спорт': <Zap className="w-8 h-8" />,
      'образование': <Award className="w-8 h-8" />,
      'развлечения': <Sparkles className="w-8 h-8" />,
      'искусство': <Heart className="w-8 h-8" />,
      'природа': <Eye className="w-8 h-8" />,
      'путешествия': <MapPin className="w-8 h-8" />,
      'технологии': <Users className="w-8 h-8" />,
      'музыка': <Star className="w-8 h-8" />
    }
    
    return iconMap[category.slug] || <Calendar className="w-8 h-8" />
  }

  const getCategoryImage = (category: Category) => {
    if (category.coverImage) {
      return category.coverImage
    }
    
    const defaultImages = {
      'театр': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center',
      'музей': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center',
      'спорт': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center',
      'образование': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&crop=center',
      'развлечения': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop&crop=center',
      'искусство': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center',
      'природа': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&crop=center',
      'путешествия': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop&crop=center',
      'технологии': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop&crop=center',
      'музыка': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop&crop=center'
    }
    
    return defaultImages[category.slug as keyof typeof defaultImages] || defaultImages['театр']
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 w-full">
      <div className="w-full">
        {/* Заголовок с фоном - во всю ширину */}
        <div className="relative">
          <div className="relative bg-cover bg-center bg-no-repeat" 
               style={{ backgroundImage: 'url(/pictures/img_afisha_3.png)' }}>
            {/* Контент */}
            <div className="flex items-center justify-center min-h-[150px] px-4">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  События в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {cityName}
                  </span>
                </h2>
                <p className="text-base text-gray-700">
                  Найдите интересные мероприятия для всей семьи
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Рекомендуемый блок - отдельный как на картинке - только для мобильных */}
        <div className="w-full mb-6 px-4 block sm:hidden">
          {isLoadingHero ? (
            <div className="w-full h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-gray-500 text-sm">Загрузка мероприятий...</div>
            </div>
          ) : heroEvent ? (
            <Link 
              href={`/event/${heroEvent.slug}`} 
              className="block w-full"
              onClick={async () => {
                if (currentSlotId) {
                  try {
                    await fetch(`/api/admin/hero-slots/${currentSlotId}/click`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })
                  } catch (error) {
                    console.error('Error tracking hero slot click:', error)
                  }
                }
              }}
            >
              <div className="relative w-full h-[200px] rounded-2xl overflow-hidden shadow-lg">
                {/* Фотография мероприятия - на весь блок */}
                <img 
                  src={heroEvent.coverImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center"}
                  alt={heroEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                
                {/* Бейдж Рекомендуем - левый верхний угол */}
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    Рекомендуем
                  </div>
                </div>
                
                {/* Бейдж РЕКЛАМА - показываем только для рекламных мероприятий */}
                {heroEvent.isAd && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      РЕКЛАМА
                    </div>
                  </div>
                )}
                
                {/* Подсказка с ценой - правый нижний угол */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-800">
                    {!heroEvent.minPrice || heroEvent.minPrice === 0 ? 'Бесплатно' : `от ${heroEvent.minPrice} ₽`}
                  </div>
                </div>
                
                {/* Название и даты мероприятия - поверх фотографии */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="font-bold text-xl mb-1 text-white">{heroEvent.title}</h4>
                  <p className="text-white/90 text-base">
                    {(() => {
                      const startDate = new Date(heroEvent.startDate)
                      const endDate = new Date(heroEvent.endDate)
                      const startFormatted = startDate.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long' 
                      })
                      const endFormatted = endDate.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long' 
                      })
                      
                      if (startFormatted === endFormatted) {
                        return startFormatted
                      }
                      return `${startFormatted} - ${endFormatted}`
                    })()}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-full h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-gray-500 text-sm">Нет мероприятий</div>
            </div>
          )}
        </div>

        {/* Остальные категории - 2 в строку */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-5">
            {(showAllCategories ? categories : categories.slice(0, 4)).map((category, index) => {
              const isHovered = hoveredCard === category.id
              const isHidden = !showAllCategories && index >= 4
              
              return (
                <div
                  key={category.id}
                  className={`transform transition-all duration-300 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  } ${isHidden ? 'opacity-50' : ''}`}
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Link href={`/${citySlug}/events?categories=${category.slug}`}>
                    <div
                      className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-20 ${
                        isHovered ? 'scale-105' : 'scale-100'
                      }`}
                    >
                      {/* Фоновое изображение */}
                      <div className="absolute inset-0">
                        <img 
                          src={getCategoryImage(category)}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      </div>

                      {/* Счетчик событий */}
                      <div className="absolute bottom-0 right-2" style={{ transform: 'translateY(15%) translateX(-15%)' }}>
                        <div className="text-white text-8xl font-bold opacity-50">
                          {category.eventCount}
                        </div>
                      </div>

                      {/* Контент */}
                      <div className="relative p-2 text-white h-full flex flex-col justify-end">
                        <div className="flex items-center gap-1 mb-1">
                          {category.icon && (
                            <div className="transform group-hover:scale-110 transition-transform duration-300">
                              {getCategoryIcon(category)}
                            </div>
                          )}
                          <h3 className="text-xs font-bold text-white transition-colors duration-300 truncate">
                            {category.name}
                          </h3>
                        </div>
                      </div>

                      {/* Эффект свечения при наведении */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`} />
                      
                      {/* Белый градиент для скрытых категорий */}
                      {isHidden && (
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
          
          {/* Показываем кнопку "Показать все" только если категорий больше 4 */}
          {categories.length > 4 && !showAllCategories && (
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => setShowAllCategories(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Показать все ({categories.length - 4} еще)
              </button>
            </div>
          )}
          
          {/* Градиентная кнопка "Посмотреть все" */}
          <div className="mt-6 flex justify-center">
            <Link href={`/${citySlug}/events`}>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Посмотреть все
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
