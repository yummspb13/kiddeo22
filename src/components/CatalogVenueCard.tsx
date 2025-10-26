'use client';

import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { VenueImageCarousel } from './VenueImageCarousel';

interface CatalogVenueCardProps {
  venue: any;
  citySlug: string;
}

export function CatalogVenueCard({ venue, citySlug }: CatalogVenueCardProps) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
    >
      <div className="aspect-[4/3] relative overflow-hidden rounded-3xl">
        <VenueImageCarousel
          venueId={venue.id}
          images={venue.images || (venue.heroImage ? [venue.heroImage] : [])}
          showIndicators={false}
        />

        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

        {/* Subcategory badge */}
        <div className="absolute left-2" style={{ top: '7px' }}>
          <span className="inline-flex items-center px-2 py-1 rounded-xl text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg font-unbounded">
            {venue.subcategory?.name || 'Место'}
          </span>
        </div>

        {/* New badge */}
        <div className="absolute right-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl px-2 py-1 text-[10px] font-semibold text-white shadow-lg" style={{ top: '7px' }}>
          <div className="flex items-center gap-1 font-unbounded">
            ✨ Новые
          </div>
        </div>

        {/* Hover overlay with action */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] font-semibold text-gray-800 font-unbounded">Посмотреть</div>
          </div>
        </div>

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white" style={{ bottom: '5px' }}>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors font-unbounded">
            {venue.name}
          </h3>

          <div className="flex items-center text-xs pr-16">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate font-unbounded">{venue.address}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
