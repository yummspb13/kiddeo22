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
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Избранное</h1>
          <p className="text-gray-600 mt-1">
            События, которые вы сохранили для просмотра
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {favorites.length} событий
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              {[
                { key: "all", label: "Все события" },
                { key: "upcoming", label: "Предстоящие" },
                { key: "past", label: "Прошедшие" }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as "all" | "upcoming" | "past")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "price" | "added")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Избранное пусто</h3>
            <p className="text-gray-500 mb-4">
              {filter === "all" 
                ? "Вы еще не добавили ни одного события в избранное"
                : `Нет событий в категории "${filter === "upcoming" ? "Предстоящие" : "Прошедшие"}"`
              }
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Найти события
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {favorite.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {favorite.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {favorite.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
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
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{favorite.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{favorite.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900">
                      {favorite.price} ₽
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика избранного</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{favorites.length}</div>
              <div className="text-sm text-gray-500">Всего в избранном</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {favorites.filter(fav => isUpcoming(fav.date)).length}
              </div>
              <div className="text-sm text-gray-500">Предстоящих</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(favorites.reduce((sum, fav) => sum + fav.price, 0) / favorites.length) || 0} ₽
              </div>
              <div className="text-sm text-gray-500">Средняя цена</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(favorites.reduce((sum, fav) => sum + fav.rating, 0) / favorites.length * 10) / 10 || 0}
              </div>
              <div className="text-sm text-gray-500">Средний рейтинг</div>
            </div>
          </div>
        </div>
    </div>
  )
}
