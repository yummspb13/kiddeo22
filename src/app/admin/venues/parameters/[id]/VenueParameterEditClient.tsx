'use client'

import { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Edit, Copy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VenueSubcategoryDetails {
  id: number
  name: string
  category: {
    name: string
  }
  parameters: unknown[]
}

export default function VenueParameterEditClient({ subcategoryId, k }: { subcategoryId: number; k: string }) {
  const [subcategory, setSubcategory] = useState<VenueSubcategoryDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [cloningParameter, setCloningParameter] = useState<any>(null)
  const [selectedTariff, setSelectedTariff] = useState<'free' | 'optimal' | 'maximum'>('free')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/venues/subcategories/${subcategoryId}${k}`)
        if (response.ok) {
          const data = await response.json()
          setSubcategory({
            ...data,
            parameters: data.parameters || []
          })
        } else {
          setSubcategory(null)
        }
      } catch (error) {
        console.error('Error:', error)
        setSubcategory(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [subcategoryId, k])

  const handleCloneParameter = (parameter: unknown) => {
    setCloningParameter(parameter)
    setShowCloneModal(true)
  }

  const handleAddParameter = () => {
    setShowAddModal(true)
  }

  const handleConfirmAdd = async () => {
    const name = (document.getElementById('newParameterName') as HTMLInputElement)?.value
    const type = (document.getElementById('newParameterType') as HTMLSelectElement)?.value
    const isFree = (document.getElementById('newParameterFree') as HTMLInputElement)?.checked
    const isOptimal = (document.getElementById('newParameterOptimal') as HTMLInputElement)?.checked
    const isMaximum = (document.getElementById('newParameterMaximum') as HTMLInputElement)?.checked

    if (!name || !type) {
      alert('Пожалуйста, заполните название и выберите тип параметра')
      return
    }

    if (!isFree && !isOptimal && !isMaximum) {
      alert('Пожалуйста, выберите хотя бы один тариф')
      return
    }

    try {
      const newParameter = {
        subcategoryId: subcategoryId,
        name: name,
        type: type,
        config: {},
        isFree: isFree || false,
        isOptimal: isOptimal || false,
        isMaximum: isMaximum || false,
        order: (subcategory?.parameters?.length || 0) + 1,
        isActive: true
      }

      const response = await fetch(`/api/admin/venues/parameters?key=${k}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParameter),
      })

      if (response.ok) {
        // Обновляем список параметров
        const fetchData = async () => {
          try {
            const response = await fetch(`/api/admin/venues/subcategories/${subcategoryId}${k}`)
            if (response.ok) {
              const data = await response.json()
              setSubcategory({
                ...data,
                parameters: data.parameters || []
              })
            }
          } catch (error) {
            console.error('Error fetching subcategories:', error)
          }
        }
        fetchData()
        
        setShowAddModal(false)
        alert('Параметр успешно добавлен!')
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при добавлении параметра')
      }
    } catch (error) {
      console.error('Error adding parameter:', error)
      alert('Ошибка при добавлении параметра')
    }
  }

  const handleConfirmClone = async () => {
    if (!cloningParameter) return

    try {
      // Создаем клон параметра с выбранным тарифом
      const cloneData = {
        subcategoryId: cloningParameter.subcategoryId,
        name: `${cloningParameter.name} (${selectedTariff.toUpperCase()})`,
        type: cloningParameter.type,
        config: cloningParameter.config,
        isFree: selectedTariff === 'free',
        isOptimal: selectedTariff === 'optimal',
        isMaximum: selectedTariff === 'maximum',
        order: cloningParameter.order + 1,
        isActive: true
      }

      const response = await fetch(`/api/admin/venues/parameters?key=${k}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      })

      if (response.ok) {
        // Обновляем список параметров
        const fetchData = async () => {
          try {
            const response = await fetch(`/api/admin/venues/subcategories/${subcategoryId}${k}`)
            if (response.ok) {
              const data = await response.json()
              setSubcategory({
                ...data,
                parameters: data.parameters || []
              })
            }
          } catch (error) {
            console.error('Error fetching subcategories:', error)
          }
        }
        fetchData()
        
        setShowCloneModal(false)
        setCloningParameter(null)
        alert('Параметр успешно клонирован!')
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при клонировании параметра')
      }
    } catch (error) {
      console.error('Error cloning parameter:', error)
      alert('Ошибка при клонировании параметра')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Загрузка данных подкатегории...</p>
      </div>
    )
  }

  if (!subcategory) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Подкатегория не найдена.</p>
        <p className="text-sm mt-2">ID: {subcategoryId}, Key: {k}</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 inline-block mr-1" /> Вернуться к списку
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок страницы редактирования */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{subcategory.name}</h1>
          <p className="text-sm text-gray-600">Категория: {subcategory.category.name}</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/admin/venues/subcategories${k}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 inline-block mr-2" />
            Назад к подкатегориям
          </Link>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Добавить параметр
          </button>
        </div>
      </div>

      {/* Список параметров */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Параметры подкатегории</h2>
        </div>
        <div className="p-6">
          {subcategory.parameters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Параметры не найдены</p>
              <p className="text-sm mt-2">Добавьте первый параметр для этой подкатегории</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subcategory.parameters.map((parameter: any) => (
                <div key={parameter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{parameter.name}</h3>
                    <p className="text-sm text-gray-500">Тип: {parameter.type}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        parameter.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {parameter.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                      <span className="text-xs text-gray-500">Порядок: {parameter.order}</span>
                      <div className="flex space-x-1">
                        {parameter.isFree && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Free</span>}
                        {parameter.isOptimal && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Optimal</span>}
                        {parameter.isMaximum && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Maximum</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/venues/parameters/edit/${parameter.id}?key=${k}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleCloneParameter(parameter)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Клонировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно клонирования */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Клонировать параметр
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Выберите тариф для клонирования параметра "{cloningParameter?.name}"
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="free"
                    checked={selectedTariff === 'free'}
                    onChange={(e) => setSelectedTariff(e.target.value as 'free')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Бесплатный тариф (Free)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="optimal"
                    checked={selectedTariff === 'optimal'}
                    onChange={(e) => setSelectedTariff(e.target.value as 'optimal')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Оптимальный тариф (Optimal)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="maximum"
                    checked={selectedTariff === 'maximum'}
                    onChange={(e) => setSelectedTariff(e.target.value as 'maximum')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Максимальный тариф (Maximum)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCloneModal(false)
                    setCloningParameter(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmClone}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Клонировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления параметра */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добавить новый параметр
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Создать новый параметр для подкатегории "{subcategory?.name}"
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название параметра
                  </label>
                  <input
                    type="text"
                    id="newParameterName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите название параметра"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип параметра
                  </label>
                  <select
                    id="newParameterType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEXT">Текст</option>
                    <option value="TEXTAREA">Многострочный текст</option>
                    <option value="SELECT">Выпадающий список</option>
                    <option value="RADIO">Радиокнопки</option>
                    <option value="CHECKBOX">Чекбоксы</option>
                    <option value="NUMBER">Число</option>
                    <option value="PHOTO_UPLOADER">Загрузка фото</option>
                    <option value="MAP_ADDRESS">Адрес на карте</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Доступность по тарифам
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="newParameterFree"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Бесплатный тариф</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="newParameterOptimal"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Оптимальный тариф</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="newParameterMaximum"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Максимальный тариф</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}