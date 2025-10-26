'use client';

import { useState } from 'react';
import { Star, MapPin, DollarSign, Calendar, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

interface VenueAd {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  tariff: 'FREE' | 'SUPER' | 'MAXIMUM';
  address: string | null;
  district: string | null;
  city: {
    id: number;
    name: string;
    slug: string;
  };
  subcategory: {
    category: {
      name: string;
    };
  };
}

interface VenueAdListProps {
  venueAds: VenueAd[];
  onEdit: (venue: VenueAd) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}

export default function VenueAdList({ 
  venueAds, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: VenueAdListProps) {
  const [activeTab, setActiveTab] = useState('RECOMMENDED');

  const tabs = [
    { id: 'RECOMMENDED', label: 'Рекомендуем', count: venueAds.length },
    { id: 'FEATURED', label: 'Популярные', count: 0 },
    { id: 'POPULAR', label: 'Новинки', count: 0 },
  ];

  const getTariffColor = (tariff: string) => {
    switch (tariff) {
      case 'MAXIMUM':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'SUPER':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTariffLabel = (tariff: string) => {
    switch (tariff) {
      case 'MAXIMUM':
        return 'МАКСИМУМ';
      case 'SUPER':
        return 'СУПЕР';
      default:
        return 'БЕСПЛАТНО';
    }
  };

  const formatPrice = (priceFrom: number | null, priceTo: number | null) => {
    if (!priceFrom) return 'Бесплатно';
    if (priceTo && priceTo !== priceFrom) {
      return `${priceFrom.toLocaleString()} - ${priceTo.toLocaleString()} ₽`;
    }
    return `от ${priceFrom.toLocaleString()} ₽`;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Venue Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venueAds.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              {venue.coverImage ? (
                <img
                  src={venue.coverImage}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white opacity-80" />
                </div>
              )}
              
              {/* Tariff Badge */}
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTariffColor(venue.tariff)}`}>
                  {getTariffLabel(venue.tariff)}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(venue)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(venue.id)}
                  className="p-2 bg-red-500/90 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                {venue.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {venue.description || 'Описание не указано'}
              </p>

              {/* Location */}
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">
                  {venue.address || venue.district || venue.city.name}
                </span>
              </div>

              {/* Category */}
              <div className="text-sm text-gray-500 mb-3">
                {venue.subcategory.category.name}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg font-semibold text-gray-900">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {formatPrice(venue.priceFrom, venue.priceTo)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleActive(venue.id, true)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Активна"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleActive(venue.id, false)}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
                    title="Неактивна"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {venueAds.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Рекламных мест пока нет
          </h3>
          <p className="text-gray-600">
            Добавьте места в рекламные разделы для их продвижения
          </p>
        </div>
      )}
    </div>
  );
}
