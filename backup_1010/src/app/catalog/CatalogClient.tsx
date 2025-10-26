"use client"

import { useState, useEffect, useMemo } from "react"
import { Map, List, Filter, Heart } from "lucide-react"
import AdvancedFilters from "@/components/catalog/AdvancedFilters"
import EventCard from "@/components/catalog/EventCard"
import EventMap from "@/components/catalog/EventMap"
import EventListSkeleton from "@/components/catalog/EventListSkeleton"
import { City } from "@/lib/types"

interface Event {
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
  lat?: number
  lng?: number
}

interface FilterState {
  ageFrom: number | null
  ageTo: number | null
  dateFilter: "today" | "tomorrow" | "weekend" | "all" | null
  priceFilter: "free" | "paid" | "all" | null
  indoorFilter: "indoor" | "outdoor" | "all" | null
  district: string | null
  radius: number | null
  priceFrom: number | null
  priceTo: number | null
}

interface CatalogClientProps {
  cities: City[]
}

export default function CatalogClient({ cities }: CatalogClientProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [filters, setFilters] = useState<FilterState>({
    ageFrom: null,
    ageTo: null,
    dateFilter: null,
    priceFilter: null,
    indoorFilter: null,
    district: null,
    radius: null,
    priceFrom: null,
    priceTo: null,
  })
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Загрузка событий (заглушка для демо)
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      
      // Имитация загрузки
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Демо-данные
      const demoEvents: Event[] = [
        {
          id: 1,
          title: "Мастер-класс по рисованию",
          description: "Увлекательный мастер-класс для детей от 5 лет",
          imageUrl: "/demo/art-class.jpg",
          price: 1500,
          isFree: false,
          date: new Date("2024-01-15"),
          time: "15:00",
          address: "ул. Тверская, 15",
          district: "Центр",
          ageFrom: 5,
          ageTo: 12,
          isIndoor: true,
          rating: 4.8,
          reviewsCount: 24,
          lat: 55.7558,
          lng: 37.6176
        },
        {
          id: 2,
          title: "Прогулка по парку",
          description: "Семейная прогулка с экскурсией",
          imageUrl: "/demo/park-walk.jpg",
          price: 0,
          isFree: true,
          date: new Date("2024-01-16"),
          time: "10:00",
          address: "Парк Сокольники",
          district: "СВАО",
          ageFrom: 3,
          ageTo: 10,
          isIndoor: false,
          rating: 4.6,
          reviewsCount: 18,
          lat: 55.7908,
          lng: 37.6789
        },
        {
          id: 3,
          title: "Кулинарный мастер-класс",
          description: "Учимся готовить пиццу",
          imageUrl: "/demo/cooking-class.jpg",
          price: 2000,
          isFree: false,
          date: new Date("2024-01-17"),
          time: "16:00",
          address: "ул. Арбат, 25",
          district: "Центр",
          ageFrom: 6,
          ageTo: 14,
          isIndoor: true,
          rating: 4.9,
          reviewsCount: 31,
          lat: 55.7522,
          lng: 37.5911
        }
      ]
      
      setEvents(demoEvents)
      setFilteredEvents(demoEvents)
      setIsLoading(false)
    }

    loadEvents()
  }, [])

  // Фильтрация событий
  useEffect(() => {
    let filtered = [...events]

    // Фильтр по возрасту
    if (filters.ageFrom !== null) {
      filtered = filtered.filter(event => 
        event.ageFrom === null || event.ageFrom === undefined || event.ageFrom <= filters.ageFrom!
      )
    }
    if (filters.ageTo !== null) {
      filtered = filtered.filter(event => 
        event.ageTo === null || event.ageTo === undefined || event.ageTo >= filters.ageTo!
      )
    }

    // Фильтр по дате
    if (filters.dateFilter) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const weekend = new Date(today.getTime() + (6 - today.getDay()) * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(event => {
        if (!event.date) return false
        
        const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
        
        switch (filters.dateFilter) {
          case "today":
            return eventDate.getTime() === today.getTime()
          case "tomorrow":
            return eventDate.getTime() === tomorrow.getTime()
          case "weekend":
            return eventDate.getTime() >= weekend.getTime() && eventDate.getTime() < weekend.getTime() + 2 * 24 * 60 * 60 * 1000
          default:
            return true
        }
      })
    }

    // Фильтр по цене
    if (filters.priceFilter === "free") {
      filtered = filtered.filter(event => event.isFree)
    } else if (filters.priceFilter === "paid") {
      filtered = filtered.filter(event => !event.isFree)
    }

    // Фильтр по месту
    if (filters.indoorFilter === "indoor") {
      filtered = filtered.filter(event => event.isIndoor === true)
    } else if (filters.indoorFilter === "outdoor") {
      filtered = filtered.filter(event => event.isIndoor === false)
    }

    // Фильтр по району
    if (filters.district) {
      filtered = filtered.filter(event => event.district === filters.district)
    }

    // Фильтр по ценовому диапазону
    if (filters.priceFrom !== null) {
      filtered = filtered.filter(event => 
        event.price === null || event.price === undefined || event.price >= filters.priceFrom!
      )
    }
    if (filters.priceTo !== null) {
      filtered = filtered.filter(event => 
        event.price === null || event.price === undefined || event.price <= filters.priceTo!
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters])

  const handleToggleFavorite = async (eventId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
      } else {
        newFavorites.add(eventId)
      }
      return newFavorites
    })
  }

  const handleAddToCart = async (eventId: number) => {
    // Имитация добавления в корзину
    console.log("Adding to cart:", eventId)
  }

  const handleEventClick = (event: Event) => {
    console.log("Event clicked:", event)
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <AdvancedFilters
        cities={cities}
        onFiltersChange={setFilters}
        initialFilters={filters}
      />

      {/* Панель управления */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Найдено: <span className="font-medium">{filteredEvents.length}</span> событий
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`p-2 rounded-md ${
              viewMode === "map" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Контент */}
      {isLoading ? (
        <EventListSkeleton count={6} />
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              {...event}
              isFavorite={favorites.has(event.id)}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <EventMap
          events={filteredEvents.filter(event => event.lat && event.lng).map(event => ({
            id: event.id,
            title: event.title,
            lat: event.lat!,
            lng: event.lng!
          }))}
          onEventClick={handleEventClick}
          className="h-96"
        />
      )}

      {/* Пустое состояние */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            События не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}
    </div>
  )
}
