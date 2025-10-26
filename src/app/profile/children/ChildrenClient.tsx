"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Calendar, User, Heart } from "lucide-react"

interface Child {
  id: number
  name: string
  birthDate: string
  gender: string
  interests: string[]
  avatar?: string
}

interface ChildrenClientProps {
  userId: string
}

export default function ChildrenClient({ userId }: ChildrenClientProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  // Заглушка для демонстрации
  useEffect(() => {
    // Здесь будет загрузка детей из API
    setChildren([
      {
        id: 1,
        name: "Анна",
        birthDate: "2018-05-15",
        gender: "female",
        interests: ["рисование", "танцы", "музыка"],
        avatar: "/avatars/girl-1.png"
      },
      {
        id: 2,
        name: "Максим",
        birthDate: "2020-08-22",
        gender: "male",
        interests: ["спорт", "конструкторы", "машины"],
        avatar: "/avatars/boy-1.png"
      }
    ])
  }, [])

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getGenderIcon = (gender: string) => {
    return gender === "female" ? "👧" : gender === "male" ? "👦" : "🧒"
  }

  const getInterestColor = (interest: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800", 
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800"
    ]
    return colors[interest.length % colors.length]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 profile-card-mobile md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0 profile-flex-mobile profile-flex-col-mobile md:flex-col md:sm:flex-row md:sm:items-center md:justify-between md:mb-4 md:sm:mb-6 md:space-y-3 md:sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 profile-text-xl-mobile md:text-xl md:sm:text-2xl">Мои дети</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base profile-text-sm-mobile md:text-sm md:sm:text-base">
            Управляйте профилями ваших детей для персонализированных рекомендаций
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base profile-btn-mobile profile-btn-primary-mobile md:flex md:items-center md:space-x-2 md:bg-blue-600 md:text-white md:px-3 md:sm:px-4 md:py-2 md:rounded-lg md:hover:bg-blue-700 md:transition-colors md:text-sm md:sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 profile-w-4-mobile profile-h-4-mobile md:w-4 md:h-4 md:sm:w-5 md:sm:h-5" />
          <span>Добавить ребенка</span>
        </button>
      </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 profile-grid-1-mobile md:grid-cols-1 md:sm:grid-cols-2 md:lg:grid-cols-3">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow profile-card-mobile md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:sm:p-6 md:hover:shadow-md md:transition-shadow">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl">
                    {getGenderIcon(child.gender)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {calculateAge(child.birthDate)} лет
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setEditingChild(child)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{new Date(child.birthDate).toLocaleDateString('ru-RU')}</span>
                </div>

                {child.interests.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Интересы:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {child.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${getInterestColor(interest)}`}
                        >
                          {interest}
                        </span>
                      ))}
                      {child.interests.length > 3 && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{child.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 sm:pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Рекомендаций</span>
                    <span className="font-medium text-blue-600">12</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Child Card */}
          {children.length < 15 && (
            <div
              onClick={() => setIsAdding(true)}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Добавить ребенка</h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Создайте профиль для персонализированных рекомендаций
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Статистика</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{children.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Всего детей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {children.reduce((acc, child) => acc + child.interests.length, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Интересов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">0</div>
              <div className="text-xs sm:text-sm text-gray-500">Рекомендаций</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal Placeholder */}
        {isAdding && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                {editingChild ? "Редактировать ребенка" : "Добавить ребенка"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Здесь будет форма для добавления/редактирования ребенка
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setEditingChild(null)
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setEditingChild(null)
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
