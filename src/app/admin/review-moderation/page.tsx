import { Suspense } from 'react'
import ReviewModerationClient from './ReviewModerationClient'

export default function ReviewModerationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-unbounded">
            Модерация отзывов через AI
          </h1>
          <p className="mt-2 text-gray-600">
            Универсальная система модерации отзывов для Афиши и Мест
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        }>
          <ReviewModerationClient />
        </Suspense>
      </div>
    </div>
  )
}
