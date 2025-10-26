'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, Calendar, MapPin, DollarSign, Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useHorizontalSwipe } from '@/hooks/useSwipe'
import { useLazyLoad } from '@/hooks/useIntersectionObserver'
import CategoryCard from './cards/CategoryCard'
import { CatalogVenueCard } from '../CatalogVenueCard'

interface HomePageBlockProps {
  blockType: string
  title: string
  description?: string
  content: any[]
  citySlug: string
  showAllLink?: string
}

const BLOCK_TYPES = {
  'POPULAR_EVENTS': 'Популярные события',
  'POPULAR_VENUES': 'Популярные места',
  'POPULAR_SERVICES': 'Популярные услуги',
  'CATEGORIES': 'Категории',
  'COLLECTIONS': 'Подборки',
  'RECOMMENDED': 'Рекомендуем',
  'NEW_IN_CATALOG': 'Новые в каталоге',
  'BLOG_POSTS': 'Полезные статьи'
}

const SHOW_ALL_LINKS = {
  'POPULAR_EVENTS': '/{citySlug}/events',
  'POPULAR_VENUES': '/city/{citySlug}/cat/venues',
  'POPULAR_SERVICES': '/city/{citySlug}/cat/services',
  'CATEGORIES': '/city/{citySlug}/categories',
  'COLLECTIONS': '/city/{citySlug}/collections',
  'RECOMMENDED': '/city/{citySlug}/recommended',
  'NEW_IN_CATALOG': '/city/{citySlug}/new',
  'BLOG_POSTS': '/blog'
}

export default function HomePageBlock({ 
  blockType, 
  title, 
  description, 
  content, 
  citySlug,
  showAllLink 
}: HomePageBlockProps) {
  const defaultTitle = BLOCK_TYPES[blockType as keyof typeof BLOCK_TYPES] || blockType
  const displayTitle = title || defaultTitle
  const defaultShowAllLink = SHOW_ALL_LINKS[blockType as keyof typeof SHOW_ALL_LINKS]?.replace('{citySlug}', citySlug)
  const link = showAllLink || defaultShowAllLink

  // Если нет контента, показываем заглушку
  if (!content || content.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">{displayTitle}</h2>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>
          {link && (
            <Link 
              href={link} 
              className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Все {displayTitle.toLowerCase()}
            </Link>
          )}
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-gray-400 mb-4">
            <Sparkles className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Пока здесь пусто
          </h3>
          <p className="text-gray-500">
            Скоро здесь появятся интересные {displayTitle.toLowerCase()}
          </p>
        </div>
      </section>
    )
  }

  // Для событий, мест, подборок, рекомендуемых, новых и статей используем карусель
  if (['POPULAR_EVENTS', 'POPULAR_VENUES', 'COLLECTIONS', 'RECOMMENDED', 'NEW_IN_CATALOG', 'BLOG_POSTS'].includes(blockType)) {
    return <EventsCarousel 
      title={displayTitle} 
      description={description} 
      content={content} 
      citySlug={citySlug} 
      showAllLink={link} 
      blockType={blockType}
    />
  }

  // Для категорий используем отдельный компонент с кнопкой
  if (blockType === 'CATEGORIES') {
    return <CategoriesBlock 
      title={displayTitle} 
      description={description} 
      content={content} 
      citySlug={citySlug} 
      showAllLink={link} 
    />
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">{displayTitle}</h2>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        {link && (
          <Link 
            href={link} 
            className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
          >
            Все {defaultTitle.toLowerCase()}
          </Link>
        )}
      </div>
      
      <div className={`grid gap-6 ${
        blockType === 'CATEGORIES' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' 
          : blockType === 'COLLECTIONS'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {content.map((item, index) => (
          blockType === 'CATEGORIES' ? (
            <CategoryCard key={`${item.id}-${index}`} item={item} citySlug={citySlug} />
          ) : (
            <ContentCard key={`${item.id}-${index}`} item={item} index={index} citySlug={citySlug} blockType={blockType} />
          )
        ))}
      </div>
    </section>
  )
}

function EventsCarousel({ 
  title, 
  description, 
  content, 
  citySlug, 
  showAllLink,
  blockType
}: { 
  title: string
  description?: string
  content: any[]
  citySlug: string
  showAllLink?: string
  blockType?: string
}) {
  
  // Функция для получения текста кнопки в зависимости от типа блока
  const getButtonText = (blockType: string) => {
    switch (blockType) {
      case 'POPULAR_EVENTS': return 'Все события'
      case 'POPULAR_VENUES': return 'Все места'
      case 'POPULAR_SERVICES': return 'Все услуги'
      case 'CATEGORIES': return 'Все категории'
      case 'COLLECTIONS': return 'Все подборки'
      case 'RECOMMENDED': return null // Убираем кнопку
      case 'NEW_IN_CATALOG': return null // Убираем кнопку
      case 'BLOG_POSTS': return 'Все статьи'
      default: return 'Все'
    }
  }
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [showSwipeIndicators, setShowSwipeIndicators] = useState(false)
  const [canSwipeLeft, setCanSwipeLeft] = useState(false)
  const [canSwipeRight, setCanSwipeRight] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3
    const width = window.innerWidth
    if (width < 640) return 1.2 // Mobile: show 1.2 items (partial view)
    if (width < 768) return 1.5 // Small tablet: show 1.5 items
    if (width < 1024) return 2.5 // Tablet: show 2.5 items
    return 3 // Desktop: show 3 items
  }
  
  const itemsPerView = getItemsPerView()
  const maxIndex = isClient ? Math.max(0, content.length - Math.floor(itemsPerView)) : 0
  const [canScroll, setCanScroll] = useState(false)
  
  // Устанавливаем isClient только на клиенте
  useEffect(() => {
    setIsClient(true)
    setIsInitialized(true)
  }, [])

  // Устанавливаем canScroll только на клиенте
  useEffect(() => {
    if (isClient) {
      setCanScroll(content.length > Math.floor(itemsPerView))
    }
  }, [isClient, content.length, itemsPerView])
  
  // Touch swipe hooks
  const { elementRef: swipeRef } = useHorizontalSwipe(
    () => {
      // Swipe left - next slide
      if (canSwipeRight) {
        nextSlide()
      }
    },
    () => {
      // Swipe right - previous slide
      if (canSwipeLeft) {
        prevSlide()
      }
    },
    {
      threshold: 50,
      velocityThreshold: 0.3,
      preventDefault: true
    }
  )

  // Обновление состояния индикаторов свайпа
  const updateSwipeIndicators = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      
      // Добавляем небольшой порог для более точного определения
      const threshold = 5
      setCanSwipeLeft(scrollLeft > threshold)
      setCanSwipeRight(scrollLeft < scrollWidth - clientWidth - threshold)
    }
  }, [])

  // Плавная прокрутка к индексу
  const scrollToIndex = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = container.scrollWidth / content.length
      const targetScroll = index * cardWidth
      
      // Добавляем класс для плавной анимации
      container.classList.add('carousel-smooth')
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
      
      // Убираем класс после анимации
      setTimeout(() => {
        container.classList.remove('carousel-smooth')
        updateSwipeIndicators()
      }, 500)
    }
    setCurrentIndex(index)
  }, [content.length, updateSwipeIndicators])

  // Навигация
  const nextSlide = useCallback(() => {
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1)
    }
  }, [currentIndex, maxIndex, scrollToIndex])

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1)
    }
  }, [currentIndex, scrollToIndex])

  // Обработчики для индикаторов свайпа
  const handleSwipeRight = useCallback(() => {
    if (canSwipeRight) {
      nextSlide()
    }
  }, [canSwipeRight, nextSlide])

  const handleSwipeLeft = useCallback(() => {
    if (canSwipeLeft) {
      prevSlide()
    }
  }, [canSwipeLeft, prevSlide])

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    // Проверяем, не кликнули ли по ссылке
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return // Не блокируем клики по ссылкам и кнопкам
    }
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.scrollBehavior = 'auto'
    scrollContainerRef.current.classList.add('carousel-dragging')
    scrollContainerRef.current.classList.remove('carousel-smooth')
    
    // Добавляем глобальные обработчики для более плавного перетаскивания
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
  }

  // Глобальные обработчики для плавного перетаскивания
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2.5 // Увеличиваем чувствительность для более плавного перетаскивания
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const handleGlobalMouseUp = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.scrollBehavior = 'smooth'
    scrollContainerRef.current.classList.remove('carousel-dragging')
    scrollContainerRef.current.classList.add('carousel-smooth')
    
    // Убираем глобальные обработчики
    document.removeEventListener('mousemove', handleGlobalMouseMove)
    document.removeEventListener('mouseup', handleGlobalMouseUp)
    
    // Плавное замедление при отпускании
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.classList.add('carousel-release')
      }
    }, 100)
  }, [handleGlobalMouseMove])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2.5 // Увеличиваем чувствительность для более плавного перетаскивания
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    handleGlobalMouseUp()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleGlobalMouseUp()
    }
  }

  // Touch handlers для мобильных устройств и планшетов
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    // Проверяем, не коснулись ли ссылки или кнопки
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return // Не блокируем касания по ссылкам и кнопкам
    }
    
    setIsTouching(true)
    setTouchStartX(e.touches[0].pageX)
    setTouchStartTime(Date.now())
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    
    // Отключаем scroll snap для плавного свайпа
    scrollContainerRef.current.style.scrollSnapType = 'none'
    scrollContainerRef.current.style.scrollBehavior = 'auto'
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching || !scrollContainerRef.current) return
    
    // Проверяем, не касаемся ли ссылки или кнопки
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return // Не блокируем касания по ссылкам и кнопкам
    }
    
    e.preventDefault() // Предотвращаем скролл страницы
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.2 // Плавная скорость для свайпа
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime
    const touchEndX = e.changedTouches[0].pageX
    const touchDistance = Math.abs(touchEndX - touchStartX)
    
    // Если это быстрый свайп (менее 300ms и больше 50px), добавляем инерцию
    if (touchDuration < 300 && touchDistance > 50) {
      const velocity = touchDistance / touchDuration
      const momentum = velocity * 0.3 // Коэффициент инерции
      
      if (scrollContainerRef.current) {
        const currentScroll = scrollContainerRef.current.scrollLeft
        const direction = touchEndX > touchStartX ? -1 : 1
        const targetScroll = currentScroll + (momentum * direction * 100)
        
        // Плавная анимация к целевой позиции
        scrollContainerRef.current.style.scrollBehavior = 'smooth'
        scrollContainerRef.current.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        })
      }
    }
    
    setIsTouching(false)
    setIsDragging(false)
    
    // Восстанавливаем scroll snap через небольшую задержку
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
        scrollContainerRef.current.style.scrollBehavior = 'smooth'
      }
    }, 100)
  }

  // Обновление индекса при прокрутке и индикаторов свайпа
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / content.length
      const newIndex = Math.round(container.scrollLeft / cardWidth)
      setCurrentIndex(Math.min(newIndex, maxIndex))
      updateSwipeIndicators()
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [content.length, maxIndex, updateSwipeIndicators])

  // Показ индикаторов свайпа при загрузке и изменении контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeIndicators(true)
      updateSwipeIndicators()
    }, 1000) // Показываем через 1 секунду после загрузки

    return () => clearTimeout(timer)
  }, [content.length, updateSwipeIndicators, canScroll])

  // Автопрокрутка при наведении (опционально)
  useEffect(() => {
    if (!isHovered || content.length <= itemsPerView) return

    const interval = setInterval(() => {
      if (currentIndex < maxIndex) {
        nextSlide()
      } else {
        scrollToIndex(0) // Возврат к началу
      }
    }, 5000) // 5 секунд

    return () => clearInterval(interval)
  }, [isHovered, currentIndex, maxIndex, nextSlide, scrollToIndex, content.length, itemsPerView])

  // Cleanup глобальных обработчиков при размонтировании
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [handleGlobalMouseMove, handleGlobalMouseUp])

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">{description}</p>
          )}
        </div>
        {showAllLink && getButtonText(blockType || '') && (
          <div className="hidden sm:block">
            <Link 
              href={showAllLink} 
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {getButtonText(blockType || '')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end space-x-4 hidden">
        <div className="flex items-center justify-between sm:justify-end space-x-4">
          {showAllLink && (
            <Link 
              href={showAllLink} 
              className="text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors text-sm md:text-base"
            >
              Все {title.toLowerCase()}
            </Link>
          )}
          
          {/* Кнопки навигации - скрыты на мобильных */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={prevSlide}
              disabled={!isInitialized || currentIndex === 0}
              className="carousel-nav-button p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              disabled={!isInitialized || currentIndex >= maxIndex}
              className="carousel-nav-button p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Карусель */}
      <div className="relative group overflow-hidden" style={{ position: 'relative' }}>
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide cursor-grab select-none carousel-smooth carousel-touch"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: (isDragging || isTouching) ? 'none' : 'x mandatory',
            touchAction: 'pan-x', // Разрешаем только горизонтальную прокрутку
            WebkitOverflowScrolling: 'touch' // Плавная прокрутка на iOS
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovered(true)}
        >
          {content.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className={`flex-shrink-0 carousel-card ${
                // Responsive widths based on screen size
                blockType === 'POPULAR_EVENTS' 
                  ? 'w-[85%] sm:w-[70%] md:w-1/2 lg:w-1/3'  // Mobile: 85%, Tablet: 70%, Desktop: 1/3
                : blockType === 'COLLECTIONS'
                  ? 'w-[85%] sm:w-[70%] md:w-1/2 lg:w-1/3'  // Mobile: 85%, Tablet: 70%, Desktop: 1/3
                : blockType === 'BLOG_POSTS'
                  ? 'w-[85%] sm:w-[70%] md:w-1/2 lg:w-1/3'  // Mobile: 85%, Tablet: 70%, Desktop: 1/3
                  : 'w-[85%] sm:w-[60%] md:w-1/2 lg:w-1/4'  // Mobile: 85%, Tablet: 60%, Desktop: 1/4
              }`}
              style={{ 
                scrollSnapAlign: 'start', 
                borderRadius: '24px', 
                overflow: 'hidden',
                minWidth: '240px' // Reduced minimum width for mobile
              }}
            >
              <ContentCard 
                item={item} 
                index={index} 
                citySlug={citySlug} 
                isDragging={isDragging}
                isTouching={isTouching}
                blockType={blockType}
              />
            </div>
          ))}
        </div>


        {/* Индикаторы свайпа - только на мобильных */}
        {showSwipeIndicators && canScroll && (
          <>
            {/* Затемнение слева */}
            <div 
              className="carousel-swipe-overlay left hidden md:block"
              style={{ 
                opacity: canSwipeLeft ? 1 : 0,
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.4), transparent)',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '80px',
                zIndex: 30,
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease-in-out',
                visibility: canSwipeLeft ? 'visible' : 'hidden',
                borderRadius: '0 24px 24px 0'
              }}
            />
            
            {/* Затемнение справа */}
            <div 
              className="carousel-swipe-overlay right hidden md:block"
              style={{ 
                opacity: canSwipeRight ? 1 : 0,
                background: 'linear-gradient(to left, rgba(0, 0, 0, 0.4), transparent)',
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '80px',
                zIndex: 30,
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease-in-out',
                visibility: canSwipeRight ? 'visible' : 'hidden',
                borderRadius: '24px 0 0 24px'
              }}
            />
            
            {/* Индикатор свайпа влево - только на desktop */}
            <button
              onClick={handleSwipeLeft}
              className="carousel-swipe-indicator left hidden md:block"
              aria-label="Прокрутить влево"
              style={{ 
                opacity: canSwipeLeft ? 1 : 0, 
                visibility: canSwipeLeft ? 'visible' : 'hidden',
                position: 'absolute',
                top: '50%',
                left: '20px',
                transform: 'translateY(-50%)',
                zIndex: 40,
                transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
              }}
            >
              <ChevronsLeft className="w-6 h-6 text-gray-400 opacity-60" />
            </button>
            
            {/* Индикатор свайпа вправо - только на desktop */}
            <button
              onClick={handleSwipeRight}
              className="carousel-swipe-indicator right hidden md:block"
              aria-label="Прокрутить вправо"
              style={{ 
                opacity: canSwipeRight ? 1 : 0, 
                visibility: canSwipeRight ? 'visible' : 'hidden',
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                zIndex: 40,
                transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
              }}
            >
              <ChevronsRight className="w-6 h-6 text-gray-400 opacity-60" />
            </button>
          </>
        )}
      </div>


      {/* Подсказка для drag - только на desktop */}
      {canScroll && (
        <div className="text-center mt-4 hidden md:block">
          <p className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            💡 Зажмите и перетащите для прокрутки
          </p>
        </div>
      )}
      
      {/* Подсказка для мобильных */}
      {canScroll && (
        <div className="text-center mt-2 md:hidden">
          <p className="text-xs text-gray-400">
            ← Проведите для прокрутки →
          </p>
        </div>
      )}
      
      {/* Кнопка для мобильных */}
      {showAllLink && getButtonText(blockType || '') && (
        <div className="text-center mt-4 sm:hidden">
          <Link 
            href={showAllLink} 
            className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {getButtonText(blockType || '')}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}

function ContentCard({ item, index = 0, citySlug, isDragging = false, isTouching = false, blockType }: { item: any; index?: number; citySlug: string; isDragging?: boolean; isTouching?: boolean; blockType?: string }) {
  // Для подборок используем специальный дизайн
  if (blockType === 'COLLECTIONS' && item.type === 'COLLECTION') {
    return <CollectionCard item={item} citySlug={citySlug} index={index} />
  }

  // Для мест в блоках "Рекомендуем" и "Новые в каталоге" используем PopularVenueCard
  if ((blockType === 'RECOMMENDED' || blockType === 'NEW_IN_CATALOG') && item.type === 'VENUE') {
    return <PopularVenueCard item={item} citySlug={citySlug} index={index} />
  }

  // Для блока "Популярные места" используем специальный дизайн
  if (blockType === 'POPULAR_VENUES' && item.type === 'VENUE') {
    return <PopularVenueCard item={item} citySlug={citySlug} index={index} />
  }

  const handleClick = (e: React.MouseEvent) => {
    // Если был drag, не переходим по ссылке
    if (isDragging || isTouching) {
      e.preventDefault()
      return
    }
    
    // Здесь можно добавить отслеживание кликов для аналитики
    if (item.adId) {
      // Отслеживаем клик по рекламному контенту
      fetch(`/api/homepage/ads/${item.adId}/click`, { method: 'POST' }).catch(console.error)
    }
    
    // Не блокируем клик по ссылке
    // e.preventDefault() убран, чтобы ссылки работали
  }

  const handleTouchClick = (e: React.TouchEvent) => {
    // Если был touch drag, не переходим по ссылке
    if (isTouching) {
      e.preventDefault()
      return
    }
    
    // Здесь можно добавить отслеживание кликов для аналитики
    if (item.adId) {
      // Отслеживаем клик по рекламному контенту
      fetch(`/api/homepage/ads/${item.adId}/click`, { method: 'POST' }).catch(console.error)
    }
    
    // Не блокируем клик по ссылке
    // e.preventDefault() убран, чтобы ссылки работали
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT': return 'СОБЫТИЕ'
      case 'VENUE': return 'МЕСТО'
      case 'SERVICE': return 'УСЛУГА'
      case 'BLOG_POST': return 'СТАТЬЯ'
      default: return 'КОНТЕНТ'
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'EVENT': return 'from-blue-500 to-purple-600'
      case 'VENUE': return 'from-green-500 to-teal-600'
      case 'SERVICE': return 'from-orange-500 to-red-500'
      case 'BLOG_POST': return 'from-pink-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'EVENT': return 'Купить билет'
      case 'VENUE': return 'Подробнее'
      case 'SERVICE': return 'Записаться'
      case 'BLOG_POST': return 'Читать'
      default: return 'Подробнее'
    }
  }

  // Убрали избыточные логи для оптимизации
  
  const linkHref = item.type === 'BLOG_POST' ? `/blog/${item.slug || item.id}` : 
                   item.type === 'EVENT' ? `/event/${item.slug || item.id}` :
                   item.type === 'VENUE' ? `/city/${citySlug}/venue/${item.slug || item.id}` :
                   item.type === 'SERVICE' ? `/city/${citySlug}/service/${item.slug || item.id}` :
                   `/city/${citySlug}/${item.type.toLowerCase()}/${item.slug || item.id}`

  // Специальная карточка для блогов
  if (item.type === 'BLOG_POST') {
    return (
      <Link
        href={linkHref}
        className="group relative shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          animationDelay: `${index * 150}ms`,
          animationName: 'fadeInUp',
          animationDuration: '0.6s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards'
        }}
        onClick={handleClick}
        onTouchEnd={handleTouchClick}
      >
        {/* Blog Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          {item.image && item.image.trim() !== '' ? (
          (() => {
            try {
              // Для локальных путей используем относительные пути, для внешних - полные URL
              const imageUrl = item.image.startsWith('http') ? item.image : item.image;
              
              return (
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  unoptimized={true}
                  onError={() => {
                    console.warn('Failed to load image:', imageUrl);
                  }}
                />
              );
            } catch (error) {
              // If URL is invalid, show fallback
              return (
                <div className="w-full h-full bg-gradient-to-br from-pink-500 via-rose-600 to-purple-600 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                </div>
              );
            }
          })()
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500 via-rose-600 to-purple-600 flex items-center justify-center">
              <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}
          
          {/* Dynamic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
          
          {/* Слева сверху - категория статьи */}
          <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg font-unbounded">
              СТАТЬЯ
            </span>
          </div>
          
          {/* Справа сверху - ничего (пустое место) */}
          
          {/* Floating decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

          {/* Снизу - название и описание */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <h3 className="text-xl font-bold mb-2 group-hover:text-pink-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
              {item.title}
            </h3>
            <p className="text-sm text-white/80 group-hover:text-white/90 transition-colors line-clamp-2 font-unbounded">
              {item.description}
            </p>

            {/* Progress bar animation */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
            </div>
          </div>

          {/* Кнопка подробнее в центре при наведении */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl text-sm font-semibold hover:bg-white transition-all duration-300 transform group-hover:scale-105 font-unbounded shadow-lg">
              Читать
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={linkHref}
      className="group relative shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        animationDelay: `${index * 150}ms`,
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards'
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchClick}
    >
      {/* Event Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {item.image && item.image.trim() !== '' ? (
          (() => {
            try {
              const imageUrl = item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${item.image}`;
              // Validate URL
              new URL(imageUrl);
              return (
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  unoptimized={true}
                  onError={() => {
                    console.warn('Failed to load image:', imageUrl);
                  }}
                />
              );
            } catch (error) {
              // If URL is invalid, show fallback
              return (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                </div>
              );
            }
          })()
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
        
        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300 font-unbounded">
          {(item.startDate || item.date) ? new Date(item.startDate || item.date).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
          }) : 'Скоро'}
        </div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
            {item.category || 'СОБЫТИЕ'}
          </span>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

        {/* Text content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
            {item.title}
          </h3>

          {/* Price info */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
                {(item.price || item.minPrice) ? `от ${item.price || item.minPrice} ₽` : 'Бесплатно'}
              </span>
              <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-unbounded">
                билеты от
              </span>
            </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>

        {/* Кнопка подробнее в центре при наведении */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl text-sm font-semibold hover:bg-white transition-all duration-300 transform group-hover:scale-105 font-unbounded shadow-lg">
              Подробнее
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

      </div>
    </Link>
  )
}

function PopularVenueCard({ item, citySlug, index }: { item: any; citySlug: string; index: number }) {
  const handleClick = (e: React.MouseEvent) => {
    // Здесь можно добавить отслеживание кликов для аналитики
    if (item.adId) {
      // Отслеживаем клик по рекламному контенту
      fetch(`/api/homepage/ads/${item.adId}/click`, { method: 'POST' }).catch(console.error)
    }
  }

  const linkHref = `/city/${citySlug}/venue/${item.slug || item.id}`

  return (
    <Link
      href={linkHref}
      className="group relative shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        animationDelay: `${index * 150}ms`,
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards'
      }}
      onClick={handleClick}
    >
      {/* Venue Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {item.image && item.image.trim() !== '' ? (
          (() => {
            try {
              const imageUrl = item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${item.image}`;
              // Validate URL
              new URL(imageUrl);
              return (
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  unoptimized={true}
                  onError={() => {
                    console.warn('Failed to load image:', imageUrl);
                  }}
                />
              );
            } catch (error) {
              // If URL is invalid, show fallback
              return (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                </div>
              );
            }
          })()
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
        
        {/* Слева сверху - бейдж подкатегории */}
        <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
            {item.subcategory?.name || item.category || 'Место'}
          </span>
        </div>
        
        {/* Справа сверху - рейтинг */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300 font-unbounded">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{item.averageRating > 0 ? item.averageRating : 'Нет оценок'}</span>
          </div>
        </div>
        
        {/* Снизу - название и адрес */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
            {item.title}
          </h3>
          <div className="flex items-center text-xs text-white/80 group-hover:text-white/90 transition-colors">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate font-unbounded">{item.location || item.district || 'Адрес не указан'}</span>
          </div>
        </div>
        
        {/* Кнопка подробнее в центре при наведении */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl text-sm font-semibold hover:bg-white transition-all duration-300 transform group-hover:scale-105 font-unbounded shadow-lg">
            Подробнее
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
        
        {/* Анимация полоски снизу */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>
    </Link>
  )
}

function CollectionCard({ item, citySlug, index }: { item: any; citySlug: string; index: number }) {
  const handleClick = (e: React.MouseEvent) => {
    // Здесь можно добавить отслеживание кликов для аналитики
    if (item.adId) {
      // Отслеживаем клик по рекламному контенту
      fetch(`/api/homepage/ads/${item.adId}/click`, { method: 'POST' }).catch(console.error)
    }
  }

  const getTotalCount = (item: any) => {
    return item.count || 0
  }

  const getCountLabel = (item: any) => {
    const count = item.count || 0
    return `${count} мест`
  }

  const linkHref = `/collections/${item.slug}`

  return (
    <Link
      href={linkHref}
      className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      style={{
        animationDelay: `${index * 200}ms`,
        animationName: 'fadeInUp',
        animationDuration: '0.8s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards'
      }}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden" style={{ height: '300px' }}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            unoptimized={true}
            onError={() => {
              console.warn('Failed to load image:', item.image);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Star className="w-12 h-12 text-white opacity-80" />
          </div>
        )}

        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

        {/* Collection badge */}
        <div className="absolute top-4 left-4 group-hover:scale-110 transition-transform duration-300">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            ПОДБОРКА
          </span>
        </div>

        {/* Count badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800 group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-lg">
          {getCountLabel(item)}
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
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors group-hover:scale-105 transform transition-transform duration-300">
            {item.title}
          </h3>
          <p className="text-white/90 text-sm group-hover:text-white transition-colors duration-300">
            {item.description || 'Подборка интересных мест для детей'}
          </p>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoriesBlock({ 
  title, 
  description, 
  content, 
  citySlug, 
  showAllLink 
}: { 
  title: string
  description?: string
  content: any[]
  citySlug: string
  showAllLink?: string
}) {
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">{description}</p>
          )}
        </div>
        {showAllLink && (
          <div className="hidden sm:block">
            <Link 
              href={showAllLink} 
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Все категории
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Сетка категорий */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {content.map((category, index) => (
          <Link
            key={category.id || index}
            href={`/city/${citySlug}/cat/${category.slug}`}
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            {/* Иконка */}
            <div className="flex justify-center mb-4">
              {category.icon ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src={category.icon}
                    alt={category.name || category.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
              )}
            </div>

            {/* Название категории */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">{category.name || category.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Кнопка для мобильных */}
      {showAllLink && (
        <div className="text-center mt-6 sm:hidden">
          <Link 
            href={showAllLink} 
            className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Все категории
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
