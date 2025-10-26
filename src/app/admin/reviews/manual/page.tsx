import { Suspense } from 'react'
import VenueReviewsClient from '../../venues/reviews/VenueReviewsClient'

export default function ManualReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-unbounded">
            Ручная модерация отзывов
          </h1>
          <p className="mt-2 text-gray-600">
            Просмотр и модерация отзывов о местах
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <VenueReviewsClient />
        </Suspense>
      </div>
    </div>
  )
}
