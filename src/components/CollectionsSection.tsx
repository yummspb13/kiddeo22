'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Star } from 'lucide-react'

interface Collection {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  slug: string
  _count: {
    eventCollections: number
    venueCollections: number
  }
}

interface CollectionsSectionProps {
  citySlug: string
}

export default function CollectionsSection({ citySlug }: CollectionsSectionProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('CollectionsSection: Loading collections for citySlug:', citySlug)
        
        const params = new URLSearchParams({
          section: 'afisha'
        })
        
        if (citySlug) {
          params.append('citySlug', citySlug)
        }
        
        const url = `/api/collections?${params}`
        console.log('CollectionsSection: Fetching URL:', url)
        
        const response = await fetch(url)
        console.log('CollectionsSection: Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('CollectionsSection: Error response:', errorText)
          throw new Error(`Failed to load collections: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('CollectionsSection: Data received:', data)
        setCollections(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error loading collections:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [citySlug])

  const getTotalCount = (collection: Collection) => {
    const eventsCount = collection._count?.eventCollections || 0
    const venuesCount = collection._count?.venueCollections || 0
    return eventsCount + venuesCount
  }

  const getCountLabel = (collection: Collection) => {
    const eventsCount = collection._count?.eventCollections || 0
    const venuesCount = collection._count?.venueCollections || 0
    
    if (eventsCount > 0 && venuesCount > 0) {
      return `${eventsCount + venuesCount} мест`
    } else if (venuesCount > 0) {
      return `${venuesCount} мест`
    } else if (eventsCount > 0) {
      return `${eventsCount} событий`
    }
    return '0 мест'
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Подборки</h2>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl shadow-xl bg-gray-200 animate-pulse"
              style={{ height: '300px' }}
            >
              <div className="w-full h-full bg-gray-300"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Ошибка загрузки подборок: {error}</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Подборок пока нет
          </h3>
          <p className="text-gray-600">
            В этом городе пока нет подборок мест
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
              style={{
                animationDelay: `${index * 200}ms`,
                animationName: 'fadeInUp',
                animationDuration: '0.8s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards'
              }}
            >
              <div className="relative overflow-hidden" style={{ height: '300px' }}>
                {collection.coverImage ? (
                  <img
                    src={collection.coverImage}
                    alt={collection.title}
                    className="w-full h-full object-cover"
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
                  {getCountLabel(collection)}
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
                    {collection.title}
                  </h3>
                  <p className="text-white/90 text-sm group-hover:text-white transition-colors duration-300">
                    {collection.description || 'Подборка интересных мест для детей'}
                  </p>

                  {/* Progress bar animation */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
