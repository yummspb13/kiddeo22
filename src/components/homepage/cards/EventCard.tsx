'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Calendar, MapPin, DollarSign } from 'lucide-react'

interface EventCardProps {
  event: {
    id: string
    title: string
    description?: string
    image?: string
    date?: string
    location?: string
    organizer?: string
    price?: number
    city?: string
    category?: string
    type: string
    isPaid: boolean
  }
  citySlug: string
}

export default function EventCard({ event, citySlug }: EventCardProps) {
  const handleClick = () => {
    // Analytics tracking
    console.log('Event card clicked:', event.id)
  }

  const handleTouchClick = () => {
    // Analytics tracking for touch devices
    console.log('Event card touched:', event.id)
  }

  return (
    <Link
      href={`/event/${event.id}`}
      className="group relative shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        animationDelay: '0ms',
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
        {event.image && event.image.trim() !== '' ? (
          (() => {
            try {
              const imageUrl = event.image.startsWith('http') ? event.image : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${event.image}`;
              // Validate URL
              new URL(imageUrl);
              return (
                <Image
                  src={imageUrl}
                  alt={event.title}
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
          {event.date ? new Date(event.date).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
          }) : 'Скоро'}
        </div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
            {event.category || 'СОБЫТИЕ'}
          </span>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
            {event.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
                {event.price ? `от ${event.price.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}
              </span>
              <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-unbounded">
                билеты от
              </span>
            </div>
            
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-300 transform group-hover:scale-105 font-unbounded">
              Подробнее
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </Link>
  )
}
