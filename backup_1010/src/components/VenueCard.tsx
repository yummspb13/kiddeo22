'use client';

import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';

interface VenueCardProps {
  venue: {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
    rating: number;
    reviewsCount: number;
    address: string;
    category: string;
    isNew?: boolean;
    isRecommended?: boolean;
  };
}

export default function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link
      href={`/city/moskva/venue/${venue.id}`}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
    >
        <div className="aspect-[4/3] relative overflow-hidden rounded-3xl">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            {venue.isNew ? 'НОВИНКА' : venue.isRecommended ? 'РЕКОМЕНДУЕМ' : venue.category}
          </span>
        </div>

        {/* Rating badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1 text-sm font-semibold text-gray-800 shadow-lg">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {venue.rating}
          </div>
        </div>

        {/* Hover overlay with action */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
              <Heart className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

        {/* Text content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors group-hover:scale-105 transform transition-transform duration-300">
            {venue.name}
          </h3>
          <p className="text-white/90 text-sm group-hover:text-white transition-colors duration-300 mb-2">
            {venue.description}
          </p>
          
          {/* Price and location */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              {venue.price}
            </span>
            <div className="flex items-center text-white/80 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {venue.address}
            </div>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
