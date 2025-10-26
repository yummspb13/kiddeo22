"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Users } from "lucide-react"

interface EventLocation {
  id: number
  title: string
  lat: number
  lng: number
  price?: number
  isFree?: boolean
  imageUrl?: string
  address?: string
}

interface EventMapProps {
  events: EventLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  onEventClick?: (event: EventLocation) => void
  className?: string
}

interface Cluster {
  lat: number
  lng: number
  count: number
  events: EventLocation[]
}

export default function EventMap({ 
  events, 
  center = { lat: 55.7558, lng: 37.6176 }, // Москва по умолчанию
  zoom = 12,
  onEventClick,
  className = "h-96"
}: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Простая кластеризация
  const clusterEvents = (events: EventLocation[], zoom: number) => {
    if (zoom > 14) {
      // На высоком зуме показываем все события
      return events.map(event => ({
        lat: event.lat,
        lng: event.lng,
        count: 1,
        events: [event]
      }))
    }

    const clusters: Cluster[] = []
    const clusterDistance = zoom > 12 ? 0.01 : 0.02 // Расстояние для кластеризации

    events.forEach(event => {
      let addedToCluster = false

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(event.lat - cluster.lat, 2) + 
          Math.pow(event.lng - cluster.lng, 2)
        )

        if (distance < clusterDistance) {
          cluster.events.push(event)
          cluster.count++
          cluster.lat = (cluster.lat * (cluster.count - 1) + event.lat) / cluster.count
          cluster.lng = (cluster.lng * (cluster.count - 1) + event.lng) / cluster.count
          addedToCluster = true
          break
        }
      }

      if (!addedToCluster) {
        clusters.push({
          lat: event.lat,
          lng: event.lng,
          count: 1,
          events: [event]
        })
      }
    })

    return clusters
  }

  useEffect(() => {
    const newClusters = clusterEvents(events, zoom)
    setClusters(newClusters)
  }, [events, zoom])

  useEffect(() => {
    if (!mapRef.current) return

    // Инициализация карты (заглушка для демо)
    setIsLoading(false)
    
    // В реальном приложении здесь была бы интеграция с Яндекс.Картами или Google Maps
    // Для демо показываем простую сетку
  }, [])

  const handleClusterClick = (cluster: Cluster) => {
    if (cluster.count === 1 && onEventClick) {
      onEventClick(cluster.events[0])
    } else {
      // Показать список событий в кластере
      console.log('Cluster clicked:', cluster)
    }
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative bg-gray-100 rounded-lg overflow-hidden`}>
      {/* Заглушка карты для демо */}
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Карта событий</p>
          <p className="text-sm">Найдено событий: {events.length}</p>
        </div>
      </div>

      {/* Кластеры (для демо) */}
      <div className="absolute inset-0 pointer-events-none">
        {clusters.map((cluster, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{
              left: `${((cluster.lng - center.lng + 0.1) / 0.2) * 100}%`,
              top: `${((cluster.lat - center.lat + 0.1) / 0.2) * 100}%`,
            }}
          >
            <button
              onClick={() => handleClusterClick(cluster)}
              className={`flex items-center justify-center rounded-full text-white font-medium transition-all duration-200 hover:scale-110 ${
                cluster.count === 1
                  ? 'w-8 h-8 bg-blue-600'
                  : 'w-10 h-10 bg-red-600'
              }`}
            >
              {cluster.count === 1 ? (
                <MapPin className="w-4 h-4" />
              ) : (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-xs">{cluster.count}</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>Событие</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
              <Users className="w-2 h-2 text-white" />
            </div>
            <span>Кластер</span>
          </div>
        </div>
      </div>
    </div>
  )
}
