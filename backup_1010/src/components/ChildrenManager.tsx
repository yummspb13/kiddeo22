'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, User } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { emitActivityEvent } from '@/hooks/useNotifications'
import { useNotifications } from '@/hooks/useNotifications'

interface Child {
  id: number
  name: string
  birthDate: string
  gender: string | null
  createdAt: string
}

interface ChildrenManagerProps {
  onStatsUpdate?: () => void
}

export default function ChildrenManager({ onStatsUpdate }: ChildrenManagerProps) {
  const { user, loading: userLoading } = useUser()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: ''
  })
  const { showSuccess, showError } = useNotifications()

  console.log('🔍 ChildrenManager - User:', user, 'UserLoading:', userLoading)

  useEffect(() => {
    console.log('🔍 ChildrenManager useEffect - User:', user, 'UserLoading:', userLoading)
    if (user?.id) {
      console.log('🔍 ChildrenManager - Fetching children for user:', user.id)
      fetchChildren()
    } else if (!userLoading) {
      console.log('🔍 ChildrenManager - No user ID after loading, setting loading to false')
      setLoading(false)
    }
  }, [user?.id, userLoading])

  const fetchChildren = async () => {
    if (!user?.id) {
      console.log('🔍 fetchChildren - No user ID')
      return
    }

    console.log('🔍 fetchChildren - Starting fetch for user:', user.id)
    try {
      const response = await fetch('/api/profile/simple-children', {
        headers: {
          'x-user-id': user.id
        }
      })
      console.log('🔍 fetchChildren - Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 fetchChildren - Data received:', data)
        setChildren(data.children)
      } else {
        console.error('🔍 fetchChildren - Response not ok:', response.status)
      }
    } catch (error) {
      console.error('🔍 fetchChildren - Error:', error)
    } finally {
      console.log('🔍 fetchChildren - Setting loading to false')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      showError('Ошибка', 'Пользователь не авторизован')
      return
    }
    
    if (!formData.name || !formData.birthDate) {
      showError('Ошибка', 'Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      const url = editingChild 
        ? `/api/profile/simple-children/${editingChild.id}`
        : '/api/profile/simple-children'
      
      const method = editingChild ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        await fetchChildren()
        onStatsUpdate?.()
        resetForm()
        
        // Отправляем уведомление о добавлении ребенка
        emitActivityEvent('child_added', {
          childId: data.child?.id,
          childName: formData.name,
          childGender: formData.gender
        })
        
        // Показываем уведомление об успехе
        showSuccess('Ребенок добавлен!', `${formData.name} успешно добавлен в профиль`)
      } else {
        const error = await response.json()
        showError('Ошибка', error.error || 'Произошла ошибка')
      }
    } catch (error) {
      console.error('Error saving child:', error)
      showError('Ошибка', 'Произошла ошибка при сохранении')
    }
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      birthDate: child.birthDate.split('T')[0], // Формат YYYY-MM-DD
      gender: child.gender || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (childId: number) => {
    if (!user?.id) {
      showError('Ошибка', 'Пользователь не авторизован')
      return
    }

    if (!confirm('Вы уверены, что хотите удалить этого ребенка?')) {
      return
    }

    try {
      const response = await fetch(`/api/profile/simple-children/${childId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        await fetchChildren()
        onStatsUpdate?.()
        showSuccess('Ребенок удален', 'Данные ребенка успешно удалены')
      } else {
        const error = await response.json()
        showError('Ошибка', error.error || 'Произошла ошибка при удалении')
      }
    } catch (error) {
      console.error('Error deleting child:', error)
      showError('Ошибка', 'Произошла ошибка при удалении')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', birthDate: '', gender: '' })
    setEditingChild(null)
    setShowForm(false)
  }

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

  if (userLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Мои дети</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить ребенка</span>
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium mb-4">
            {editingChild ? 'Редактировать ребенка' : 'Добавить ребенка'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите имя ребенка"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата рождения *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пол
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Не указан</option>
                <option value="male">Мальчик</option>
                <option value="female">Девочка</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingChild ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список детей */}
      {children.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>У вас пока нет добавленных детей</p>
          <p className="text-sm">Добавьте ребенка, чтобы получать персональные рекомендации</p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <div key={child.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{child.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{calculateAge(child.birthDate)} лет</span>
                        </div>
                        {child.gender && (
                          <span className="capitalize">
                            {child.gender === 'male' ? 'Мальчик' : 'Девочка'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(child)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
