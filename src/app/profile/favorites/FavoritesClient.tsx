"use client"

import { useState, useEffect } from "react"
import { Heart, Calendar, MapPin, Star, Eye, Trash2, Filter } from "lucide-react"

interface Favorite {
  id: string
  title: string
  description: string
  image: string
  date: string
  venue: string
  price: number
  category: string
  rating: number
  addedAt: string
}

interface FavoritesClientProps {
  userId: string
}

export default function FavoritesClient({ userId }: FavoritesClientProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")
  const [sortBy, setSortBy] = useState<"date" | "added" | "price">("date")

  // Заглушка для демонстрации
  useEffect(() => {
    setFavorites([
      {
        id: "1",
        title: "Мастер-класс по рисованию",
        description: "Учимся рисовать акварелью с профессиональным художником",
        image: "/events/drawing.jpg",
        date: "2024-09-20T15:00:00",
        venue: "Детский центр \"Радуга\"",
        price: 1500,
        category: "Творчество",
        rating: 4.8,
        addedAt: "2024-09-10T10:30:00"
      },
      {
        id: "2",
        title: "Спортивная секция по футболу",
        description: "Тренировки для детей 6-12 лет",
        image: "/events/football.jpg",
        date: "2024-09-25T17:00:00",
        venue: "Спорткомплекс \"Олимп\"",
        price: 2000,
        category: "Спорт",
        rating: 4.9,
        addedAt: "2024-09-12T14:20:00"
      },
      {
        id: "3",
        title: "Концерт детской музыки",
        description: "Живая музыка для всей семьи",
        image: "/events/concert.jpg",
        date: "2024-09-15T18:00:00",
        venue: "Концертный зал",
        price: 800,
        category: "Музыка",
        rating: 4.7,
        addedAt: "2024-09-08T09:15:00"
      }
    ])
  }, [])

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id))
  }

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date()
  }

  const filteredFavorites = favorites.filter(favorite => {
    if (filter === "upcoming") return isUpcoming(favorite.date)
    if (filter === "past") return !isUpcoming(favorite.date)
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "added":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      case "price":
        return a.price - b.price
      default:
        return 0
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 profile-card-mobile md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0 profile-flex-mobile profile-flex-col-mobile md:flex-col md:sm:flex-row md:sm:items-center md:justify-between md:mb-4 md:sm:mb-6 md:space-y-2 md:sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 profile-text-xl-mobile md:text-xl md:sm:text-2xl">Избранное</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base profile-text-sm-mobile md:text-sm md:sm:text-base">
            События, которые вы сохранили для просмотра
          </p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 profile-text-xs-mobile md:text-xs md:sm:text-sm">
          {favorites.length} событий
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {[
                { key: "all", label: "Все события" },
                { key: "upcoming", label: "Предстоящие" },
                { key: "past", label: "Прошедшие" }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as "all" | "upcoming" | "past")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "price" | "added")}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">По дате</option>
                <option value="added">По дате добавления</option>
                <option value="price">По цене</option>
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Избранное пусто</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              {filter === "all" 
                ? "Вы еще не добавили ни одного события в избранное"
                : `Нет событий в категории "${filter === "upcoming" ? "Предстоящие" : "Прошедшие"}"`
              }
            </p>
            <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              Найти события
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  </button>
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-600 text-white text-xs rounded-full">
                    {favorite.category}
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                    {favorite.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                    {favorite.description}
                  </p>
                  
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {new Date(favorite.date).toLocaleDateString('ru-RU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{favorite.venue}</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span>{favorite.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {favorite.price} ₽
                    </div>
                    <div className="flex space-x-1 sm:space-x-2">
                      <button className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                        Забронировать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Статистика избранного</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{favorites.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Всего в избранном</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {favorites.filter(fav => isUpcoming(fav.date)).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Предстоящих</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {Math.round(favorites.reduce((sum, fav) => sum + fav.price, 0) / favorites.length) || 0} ₽
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Средняя цена</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {favorites.length > 0 ? (favorites.reduce((sum, fav) => sum + fav.rating, 0) / favorites.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Средний рейтинг</div>
            </div>
          </div>
        </div>
    </div>
  )
}
