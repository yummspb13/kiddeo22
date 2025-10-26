// src/app/admin/venues/ads/page.tsx
import { Suspense } from 'react';
import VenueAdsClient from './VenueAdsClient';

export default function VenueAdsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Реклама мест</h1>
          <p className="text-gray-600 mt-2">
            Управление рекламными местами в различных разделах сайта
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        }>
          <VenueAdsClient />
        </Suspense>
      </div>
    </div>
  );
}
