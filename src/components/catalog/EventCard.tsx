"use client"

import { useState } from "react"
import { Heart, MapPin, Calendar, Clock, Users, Star } from "lucide-react"
import AnimatedButton from "@/components/ui/AnimatedButton"
import OptimisticToggle from "@/components/ui/OptimisticToggle"

interface EventCardProps {
  id: number
  title: string
  description?: string
  imageUrl?: string
  price?: number
  isFree?: boolean
  date?: Date
  time?: string
  address?: string
  district?: string
  ageFrom?: number
  ageTo?: number
  isIndoor?: boolean
  rating?: number
  reviewsCount?: number
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  onAddToCart?: (id: number) => void
  isLoading?: boolean
}

export default function EventCard({
  id,
  title,
  description,
  imageUrl,
  price,
  isFree = false,
  date,
  time,
  address,
  district,
  ageFrom,
  ageTo,
  isIndoor,
  rating,
  reviewsCount,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  isLoading = false
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    if (onAddToCart && !isAddingToCart) {
      setIsAddingToCart(true)
      try {
        await onAddToCart(id)
      } finally {
        setIsAddingToCart(false)
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: Date) => {
    try {
      if (!date || Number.isNaN(date.getTime())) {
        console.warn('Invalid date in catalog EventCard formatDate:', date)
        return 'Дата уточняется'
      }
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        weekday: 'short'
      }).format(date)
    } catch (error) {
      console.error('Error formatting date in catalog EventCard:', date, error)
      return 'Дата уточняется'
    }
  }

  const getAgeRange = () => {
    if (ageFrom && ageTo) {
      return `${ageFrom}-${ageTo} лет`
    } else if (ageFrom) {
      return `от ${ageFrom} лет`
    } else if (ageTo) {
      return `до ${ageTo} лет`
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-white rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isHovered ? 'shadow-xl' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Изображение */}
      <div className="relative h-48 bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Избранное */}
        {onToggleFavorite && (
          <div className="absolute top-3 right-3">
            <OptimisticToggle
              isActive={isFavorite}
              onToggle={async () => onToggleFavorite(id)}
              className="p-2 rounded-full bg-white/80 hover:bg-white"
            />
          </div>
        )}

        {/* Цена */}
        <div className="absolute bottom-3 left-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFree 
              ? 'bg-green-500 text-white' 
              : 'bg-white/90 text-gray-800'
          }`}>
            {isFree ? 'Бесплатно' : price ? formatPrice(price) : 'Цена по запросу'}
          </div>
        </div>

        {/* Indoor/Outdoor */}
        {isIndoor !== undefined && (
          <div className="absolute top-3 left-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isIndoor 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {isIndoor ? 'В помещении' : 'На улице'}
            </div>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-4">
        {/* Заголовок */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Описание */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Мета-информация */}
        <div className="space-y-2 mb-4">
          {/* Дата и время */}
          {date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(date)}</span>
              {time && (
                <>
                  <Clock className="w-4 h-4 ml-3 mr-2" />
                  <span>{time}</span>
                </>
              )}
            </div>
          )}

          {/* Адрес */}
          {address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}

          {/* Район */}
          {district && (
            <div className="text-sm text-gray-500">
              {district}
            </div>
          )}

          {/* Возраст */}
          {getAgeRange() && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{getAgeRange()}</span>
            </div>
          )}

          {/* Рейтинг */}
          {rating && (
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
              <span>{rating.toFixed(1)}</span>
              {reviewsCount && (
                <span className="ml-1 text-gray-500">({reviewsCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2">
          <AnimatedButton
            onClick={handleAddToCart}
            loading={isAddingToCart}
            className="flex-1"
          >
            Забронировать
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
