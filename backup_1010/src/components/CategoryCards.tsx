'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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

interface Collection {
  id: string
  title: string
  slug: string
  description?: string
  coverImage?: string
  city: string
  citySlug?: string
  _count: {
    eventCollections: number
  }
}

interface CategoryCardsProps {
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

export default function CategoryCards({ categories, citySlug }: CategoryCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set())
  const [heroEvent, setHeroEvent] = useState<HeroEvent | null>(null)
  const [isLoadingHero, setIsLoadingHero] = useState(true)
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  
  // Мемоизируем cityName чтобы избежать лишних перерендеров
  const cityName = useMemo(() => {
    return citySlug === 'moskva' ? 'Москва' : 
           citySlug === 'spb' ? 'Санкт-Петербург' : citySlug
  }, [citySlug])

  // Отладочная информация (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log('CategoryCards: Received categories:', categories.length)
  }

  // Загрузка рекламного мероприятия
  useEffect(() => {
    let isMounted = true
    
    const loadHeroEvent = async () => {
      if (!isMounted) return
      
      try {
        
            const response = await fetch(`/api/hero-slots?city=${encodeURIComponent(cityName)}`)
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (!isMounted) return
        
        if (data && data.events && data.events.length > 0) {
          // Публичный API возвращает объект с events и slotId
          if (data.slotId) {
            setCurrentSlotId(data.slotId) // Сохраняем ID слота
          }
          
          // Берем первое событие из массива
          const event = data.events[0]
          
          if (event) {
            
            // Отправляем просмотр рекламного слота
            if (data.slotId) {
              try {
                await fetch(`/api/admin/hero-slots/${data.slotId}/view`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })
              } catch (error) {
                console.error('Error tracking hero slot view:', error)
              }
            }
            
                // Упрощенная логика вычисления цены
                let calculatedPrice = 0
                
                if (event.isPaid && event.tickets) {
                  try {
                    // Парсим JSON строку в массив
                    const ticketsArray = typeof event.tickets === 'string' 
                      ? JSON.parse(event.tickets) 
                      : event.tickets
                    
                    if (Array.isArray(ticketsArray)) {
                      const prices = ticketsArray
                        .filter(ticket => ticket.price && ticket.price > 0)
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
              isAd: true,
              minPrice: calculatedPrice,
              slug: event.slug
            })
        } else {
            // Нет активных слотов - переходим в режим по умолчанию (рандомные мероприятия)
            console.log('No active hero slots found, switching to default mode')
            setCurrentSlotId(null)
            
            // Загружаем случайное мероприятие для режима по умолчанию
            const eventsResponse = await fetch(`/api/admin/afisha/events?key=kidsreview2025`)
            const eventsData = await eventsResponse.json()
            
            if (eventsData && eventsData.length > 0) {
              // Выбираем случайное мероприятие
              const randomEvent = eventsData[Math.floor(Math.random() * eventsData.length)]
              console.log('Random event for default mode:', randomEvent?.title)
              
              // Упрощенная логика вычисления цены
              let calculatedPrice = 0
              
              if (randomEvent.isPaid && randomEvent.tickets) {
                try {
                  const ticketsArray = typeof randomEvent.tickets === 'string' 
                    ? JSON.parse(randomEvent.tickets) 
                    : randomEvent.tickets
                  
                  if (Array.isArray(ticketsArray)) {
                    const prices = ticketsArray
                      .filter(ticket => ticket.price && ticket.price > 0)
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
                id: randomEvent.id,
                title: randomEvent.title,
                startDate: randomEvent.startDate,
                endDate: randomEvent.endDate,
                coverImage: randomEvent.coverImage,
                venue: randomEvent.venue,
                isAd: false, // Это не реклама, а режим по умолчанию
                minPrice: calculatedPrice,
                slug: randomEvent.slug
              })
            } else {
              setHeroEvent(null)
            }
          }
        } else {
          // Нет слотов вообще - переходим в режим по умолчанию
          console.log('No hero slots found, switching to default mode')
          setCurrentSlotId(null)
          
          // Загружаем случайное мероприятие для режима по умолчанию
          const eventsResponse = await fetch(`/api/admin/afisha/events?key=kidsreview2025`)
          const eventsData = await eventsResponse.json()
          
          if (eventsData && eventsData.length > 0) {
            // Выбираем случайное мероприятие
            const randomEvent = eventsData[Math.floor(Math.random() * eventsData.length)]
            console.log('Random event for default mode:', randomEvent?.title)
            
            // Упрощенная логика вычисления цены
            let calculatedPrice = 0
            
            if (randomEvent.isPaid && randomEvent.tickets) {
              try {
                const ticketsArray = typeof randomEvent.tickets === 'string' 
                  ? JSON.parse(randomEvent.tickets) 
                  : randomEvent.tickets
                
                if (Array.isArray(ticketsArray)) {
                  const prices = ticketsArray
                    .filter(ticket => ticket.price && ticket.price > 0)
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
              id: randomEvent.id,
              title: randomEvent.title,
              startDate: randomEvent.startDate,
              endDate: randomEvent.endDate,
              coverImage: randomEvent.coverImage,
              venue: randomEvent.venue,
              isAd: false, // Это не реклама, а режим по умолчанию
              minPrice: calculatedPrice,
              slug: randomEvent.slug
            })
          } else {
            setHeroEvent(null)
          }
        }
      } catch (error) {
        console.error('Error loading hero event:', error)
      } finally {
        setIsLoadingHero(false)
      }
    }

    loadHeroEvent()
    
    // Обновляем рекламные слоты каждые 30 секунд
    const interval = setInterval(() => {
      if (isMounted) {
        loadHeroEvent()
      }
    }, 30000)
    
        return () => {
          isMounted = false
          clearInterval(interval)
        }
      }, [cityName])

  // Загрузка подборок
  useEffect(() => {
    let isMounted = true
    
    const loadCollections = async () => {
      if (!isMounted) return
      
      try {
        const cityName = citySlug === 'moskva' ? 'Москва' : 
                        citySlug === 'spb' ? 'Санкт-Петербург' : citySlug
        
            const response = await fetch(`/api/collections?city=${encodeURIComponent(cityName)}`)
            const data = await response.json()
            
            if (!isMounted) return
            setCollections(data)
      } catch (error) {
        console.error('Error loading collections:', error)
      } finally {
        if (isMounted) {
          setIsLoadingCollections(false)
        }
      }
    }

    loadCollections()
    
        return () => {
          isMounted = false
        }
      }, [cityName])

  // Анимация появления карточек при скролле
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(entry.target.getAttribute('data-card-id') || '0')
            setViewedCards(prev => new Set([...prev, cardId]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = document.querySelectorAll('[data-card-id]')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const getCategoryIcon = useCallback((category: Category | undefined) => {
    // Если категория не существует, возвращаем дефолтную иконку
    if (!category) {
      return <span className="text-2xl">🎭</span>
    }
    
    // Если есть иконка из базы данных, используем её
    if (category.icon) {
      return <img src={category.icon} alt={category.name} className="w-10 h-10" />
    }
    
    // Иначе используем стандартные иконки
    const iconMap: { [key: string]: any } = {
      'theater': Calendar,
      'music': Star,
      'sport': Target,
      'workshop': Users,
      'art': Heart,
      'education': Award,
      'entertainment': Sparkles,
      'science': Zap,
      'default': Calendar
    }
    
    const IconComponent = iconMap[category.slug] || iconMap['default']
    return <IconComponent className="w-8 h-8" />
  }, [])

  // Фотографии для фона каждой категории
  const getCategoryImage = (category: Category) => {
    // Если есть coverImage из базы данных, используем его
    if (category.coverImage) {
      return category.coverImage
    }
    
    // Иначе используем стандартные изображения
    const images = {
      'theater': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
      'sport': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
      'workshop': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&crop=center',
      'art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center',
      'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&crop=center',
      'entertainment': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&crop=center',
      'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&crop=center',
      'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
      'games': 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&crop=center',
      'default': 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4a3?w=400&h=300&fit=crop&crop=center'
    }
    return images[category.slug as keyof typeof images] || images['default']
  }

  const getCategoryColor = (category: Category, isHovered: boolean) => {
    // Если есть цвет из базы данных, используем его
    if (category.color) {
      const baseColor = category.color.replace('#', '')
      const intensity = isHovered ? '500' : '400'
      return `from-${baseColor}-${intensity} to-${baseColor}-${intensity}`
    }
    
    // Иначе используем стандартные цвета
    const colors = {
      'theater': isHovered ? 'from-purple-500 to-pink-500' : 'from-purple-400 to-pink-400',
      'music': isHovered ? 'from-blue-500 to-cyan-500' : 'from-blue-400 to-cyan-400',
      'sport': isHovered ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400',
      'workshop': isHovered ? 'from-orange-500 to-red-500' : 'from-orange-400 to-red-400',
      'art': isHovered ? 'from-pink-500 to-rose-500' : 'from-pink-400 to-rose-400',
      'education': isHovered ? 'from-indigo-500 to-purple-500' : 'from-indigo-400 to-purple-400',
      'entertainment': isHovered ? 'from-yellow-500 to-orange-500' : 'from-yellow-400 to-orange-400',
      'science': isHovered ? 'from-teal-500 to-blue-500' : 'from-teal-400 to-blue-400',
      'default': isHovered ? 'from-gray-500 to-gray-600' : 'from-gray-400 to-gray-500'
    }
    
    return colors[category.slug as keyof typeof colors] || colors['default']
  }

  const getCategoryStats = (category: Category) => {
    const stats = [
      { icon: Calendar, label: 'Событий', value: category.eventCount },
      { icon: Users, label: 'Участников', value: Math.floor(category.eventCount * 12.5) },
      { icon: Star, label: 'Рейтинг', value: '4.8' }
    ]
    
    return stats
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full">
        {/* Заголовок */}
        <div className="text-center mb-8 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            События в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Москве
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Найдите интересные мероприятия для всей семьи
          </p>
          
        </div>

        {/* Режим "Реклама" - основной блок с рекламой */}
          <div className="w-full bg-white shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[463px]">
              {/* Левая часть - основная категория (1/3) */}
              <div className="lg:w-1/3 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative p-8 h-full flex flex-col text-white">
                  {/* Иконка, название и количество в одной строке */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                        {getCategoryIcon(categories[0])}
                      </div>
                      <h3 className="text-3xl font-bold">
                        {categories[0]?.name || 'События'}
                      </h3>
                    </div>
                    <div className="absolute top-0 text-[6rem] font-bold text-white opacity-50" style={{ right: '30px' }}>
                      {categories[0]?.eventCount || 24}
                    </div>
                  </div>
                  
                  {/* Описание */}
                  <p className="text-white/90 text-base mb-6">
                    {categories[0]?.description || 'Кукольные спектакли, детские мюзиклы и интерактивные представления'}
                  </p>

                      {/* Рекламное мероприятие с фотографией - начинается с места текста */}
                      <div className="bg-white/10 backdrop-blur-sm overflow-hidden flex-1 -mx-8 -mb-8 relative">
                        {isLoadingHero ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/70 text-sm">Загрузка...</div>
                          </div>
                        ) : heroEvent ? (
                          <Link 
                            href={`/event/${heroEvent.slug}`} 
                            className="block h-full"
                            onClick={async () => {
                              // Отправляем клик по рекламному слоту
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
                            {/* Фотография мероприятия - на весь блок */}
                            <div className="absolute inset-0">
                              <img 
                                src={heroEvent.coverImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center"}
                                alt={heroEvent.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40"></div>
                            </div>
                            
                            {/* Бейдж РЕКЛАМА - показываем только для рекламных мероприятий */}
                            {heroEvent.isAd && (
                              <div className="absolute top-3 right-3">
                                <div className="text-gray-400 text-[10px] font-medium opacity-70">
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
                            <div className="absolute bottom-4 left-4 right-4">
                              <h4 className="font-bold text-xl mb-2 text-white">{heroEvent.title}</h4>
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
                                  
                                  // Если даты одинаковые, показываем только одну
                                  if (startFormatted === endFormatted) {
                                    return startFormatted
                                  }
                                  
                                  // Если разные, показываем диапазон
                                  return `${startFormatted} - ${endFormatted}`
                                })()}
                              </p>
                            </div>
                          </Link>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/70 text-sm">Нет мероприятий</div>
                          </div>
                        )}
                      </div>
                </div>
              </div>

              {/* Правая часть - сетка категорий (2/3) */}
              <div className="lg:w-2/3 p-6 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full items-center">
                  {categories.slice(1).map((category, index) => {
                    const isHovered = hoveredCard === category.id
                    
                    return (
                      <div
                        key={category.id}
                        className={`transform transition-all duration-300 ${
                          isHovered ? 'scale-105' : 'scale-100'
                        }`}
                        onMouseEnter={() => setHoveredCard(category.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <Link href={`/city/${citySlug}/cat/events?categories=${category.slug}`}>
                          <div
                            className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32 ${
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

                            {/* Кастомные бейджи из админки */}

                            {/* Счетчик событий */}
                            <div className="absolute bottom-0 right-2" style={{ transform: 'translateY(25%)' }}>
                              <div className="text-white text-[9rem] font-bold opacity-50">
                                {category.eventCount}
                              </div>
                            </div>

                            {/* Контент */}
                            <div className="relative p-3 text-white h-full flex flex-col justify-end">
                              <div className="flex items-center gap-2 mb-2">
                                {category.icon && (
                                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                                    {getCategoryIcon(category)}
                                  </div>
                                )}
                                <h3 className="text-base font-bold text-white transition-colors duration-300 truncate">
                                  {category.name}
                                </h3>
                              </div>
                            </div>

                            {/* Эффект свечения при наведении */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                              isHovered ? 'opacity-100' : 'opacity-0'
                            }`} />
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

         {/* Подборки */}
         {!isLoadingCollections && collections.length > 0 && (
           <div className="my-8 px-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {collections.map((collection, index) => (
                 <Link
                   key={collection.id}
                   href={`/collections/${collection.slug}`}
                   className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 card-glow"
                   style={{
                     animationDelay: `${index * 200}ms`,
                     animation: 'fadeInUp 0.8s ease-out forwards'
                   }}
                 >
                   <div className="aspect-[4/3] relative overflow-hidden">
                     {collection.coverImage ? (
                       <img
                         src={collection.coverImage}
                         alt={collection.title}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                         <Sparkles className="w-16 h-16 text-white opacity-80" />
                       </div>
                     )}

                     {/* Dynamic gradient overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

                     {/* Collection badge with animation */}
                     <div className="absolute top-4 left-4 group-hover:scale-110 transition-transform duration-300">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                         ПОДБОРКА
                       </span>
                     </div>

                     {/* Event count badge with animation */}
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800 group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-lg">
                       {collection._count.eventCollections} событий
                     </div>

                     {/* Hover overlay with action */}
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                         <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                           <ArrowRight className="w-6 h-6 text-gray-800" />
                         </div>
                       </div>
                     </div>

                     {/* Floating decorative elements */}
                     <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                     <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                     {/* Text content over image */}
                     <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                       <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
                         {collection.title}
                       </h3>
                       {collection.description && (
                         <p className="text-white/90 text-sm line-clamp-2 group-hover:text-white transition-colors duration-300">
                           {collection.description}
                         </p>
                       )}

                       {/* Progress bar animation */}
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                       </div>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           </div>
         )}

        {/* Fallback если нет подборок */}
        {!isLoadingCollections && collections.length === 0 && (
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Не нашли подходящую категорию?</span>
            </div>
            <Link 
              href={`/city/${citySlug}/cat/events`}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Посмотреть все события
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
