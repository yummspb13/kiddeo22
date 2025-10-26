'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Star, Heart } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { CartItem } from '@/contexts/CartContext';

interface EventCardWithCartProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    venue?: string;
    organizer?: string;
    price?: number;
    image?: string;
    category?: string;
    ageFrom?: number;
    ageGroups?: string;
    coordinates?: string;
    viewCount?: number;
    slug: string;
  };
  variant?: 'default' | 'large' | 'compact';
  className?: string;
}

export function EventCardWithCart({ 
  event, 
  variant = 'default',
  className = '' 
}: EventCardWithCartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgeGroup = () => {
    if (event.ageGroups) {
      return event.ageGroups;
    }
    if (event.ageFrom) {
      return `${event.ageFrom}+ лет`;
    }
    return null;
  };

  const cartItem: Omit<CartItem, 'quantity'> = {
    id: `event-${event.id}`,
    type: 'ticket',
    eventId: event.id,
    title: event.title,
    description: event.description,
    price: event.price || 0,
    image: event.image,
    vendor: event.organizer || 'Организатор',
    date: formatDate(event.startDate),
    time: formatTime(event.startDate),
    location: event.venue,
    ageGroup: getAgeGroup() || undefined,
    metadata: {
      category: event.category,
      coordinates: event.coordinates,
      slug: event.slug
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
      >
        <div className="flex">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
            {event.image ? (
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Calendar className="w-8 h-8 text-purple-400" />
            )}
          </div>
          
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-900 truncate mb-1">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(event.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {event.price ? `${event.price.toLocaleString()} ₽` : 'Бесплатно'}
              </span>
              <AddToCartButton 
                item={cartItem} 
                variant="small"
                maxQuantity={10}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'large') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}
      >
        <div className="relative">
          <div className="aspect-[16/9] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            {event.image ? (
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Calendar className="w-16 h-16 text-purple-400" />
            )}
          </div>
          
          <div className="absolute top-4 right-4">
            <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <span className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {event.price ? `${event.price.toLocaleString()} ₽` : 'Бесплатно'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.startDate)}</span>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>{formatTime(event.startDate)}</span>
            </div>
            
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
            
            {event.organizer && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.organizer}</span>
              </div>
            )}
            
            {getAgeGroup() && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{getAgeGroup()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {event.price ? `${event.price.toLocaleString()} ₽` : 'Бесплатно'}
            </div>
            <AddToCartButton 
              item={cartItem} 
              variant="large"
              showQuantity
              maxQuantity={10}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}
    >
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Calendar className="w-12 h-12 text-purple-400" />
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>
        </div>
        
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/80 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {event.price ? `${event.price.toLocaleString()} ₽` : 'Бесплатно'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.startDate)}</span>
          </div>
          
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {event.price ? `${event.price.toLocaleString()} ₽` : 'Бесплатно'}
          </div>
          <AddToCartButton 
            item={cartItem} 
            variant="default"
            showQuantity
            maxQuantity={10}
          />
        </div>
      </div>
    </motion.div>
  );
}
