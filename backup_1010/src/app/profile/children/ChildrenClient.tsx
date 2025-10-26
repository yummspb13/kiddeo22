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
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои дети</h1>
          <p className="text-gray-600 mt-1">
            Управляйте профилями ваших детей для персонализированных рекомендаций
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить ребенка</span>
        </button>
      </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    {getGenderIcon(child.gender)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">
                      {calculateAge(child.birthDate)} лет
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingChild(child)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(child.birthDate).toLocaleDateString('ru-RU')}</span>
                </div>

                {child.interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Интересы:</p>
                    <div className="flex flex-wrap gap-2">
                      {child.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${getInterestColor(interest)}`}
                        >
                          {interest}
                        </span>
                      ))}
                      {child.interests.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{child.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
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
              className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Добавить ребенка</h3>
              <p className="text-sm text-gray-500 text-center">
                Создайте профиль для персонализированных рекомендаций
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{children.length}</div>
              <div className="text-sm text-gray-500">Всего детей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {children.reduce((acc, child) => acc + child.interests.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Интересов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">Рекомендаций</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal Placeholder */}
        {isAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingChild ? "Редактировать ребенка" : "Добавить ребенка"}
              </h3>
              <p className="text-gray-600 mb-4">
                Здесь будет форма для добавления/редактирования ребенка
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setEditingChild(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setEditingChild(null)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
