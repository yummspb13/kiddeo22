// src/components/vendor/SlotCalendar.tsx
"use client"

import { useState } from "react"
import { Calendar, Clock, Users, DollarSign, Plus, Edit, Trash2 } from "lucide-react"

interface TimeSlot {
  id: number
  startTime: string
  endTime: string
  maxCapacity: number
  currentBookings: number
  price: number
  isActive: boolean
  date: string
}

interface SlotCalendarProps {
  slots: TimeSlot[]
  onCreateSlot: (slot: Omit<TimeSlot, 'id' | 'currentBookings'>) => void
  onEditSlot: (id: number, slot: Partial<TimeSlot>) => void
  onDeleteSlot: (id: number) => void
  onToggleSlot: (id: number) => void
}

export default function SlotCalendar({ 
  slots, 
  onCreateSlot, 
  onEditSlot, 
  onDeleteSlot, 
  onToggleSlot 
}: SlotCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    maxCapacity: 10,
    price: 0,
    isActive: true
  })

  const slotsForDate = slots.filter(slot => slot.date === selectedDate)

  const handleCreateSlot = () => {
    onCreateSlot({
      ...formData,
      date: selectedDate
    })
    setShowCreateModal(false)
    setFormData({
      startTime: '',
      endTime: '',
      maxCapacity: 10,
      price: 0,
      isActive: true
    })
  }

  const handleEditSlot = () => {
    if (editingSlot) {
      onEditSlot(editingSlot.id, formData)
      setEditingSlot(null)
      setFormData({
        startTime: '',
        endTime: '',
        maxCapacity: 10,
        price: 0,
        isActive: true
      })
    }
  }

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot)
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: slot.maxCapacity,
      price: slot.price,
      isActive: slot.isActive
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getAvailabilityColor = (slot: TimeSlot) => {
    const percentage = (slot.currentBookings / slot.maxCapacity) * 100
    if (percentage >= 100) return 'bg-red-100 text-red-800'
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Календарь слотов</h2>
          <p className="text-gray-600">Управляйте расписанием и доступностью</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить слот
        </button>
      </div>

      {/* Выбор даты */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Выберите дату:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Слоты на выбранную дату */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Слоты на {new Date(selectedDate).toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
        </div>

        {slotsForDate.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Нет слотов</h4>
            <p className="text-gray-600 mb-4">Добавьте слоты для этой даты</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Добавить первый слот
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slotsForDate.map((slot) => (
              <div key={slot.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Время */}
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    {/* Вместимость */}
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {slot.currentBookings} / {slot.maxCapacity}
                      </span>
                    </div>

                    {/* Цена */}
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        {formatCurrency(slot.price)}
                      </span>
                    </div>

                    {/* Статус доступности */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(slot)}`}>
                      {slot.currentBookings >= slot.maxCapacity ? 'Заполнен' : 
                       (slot.currentBookings / slot.maxCapacity) >= 0.8 ? 'Почти заполнен' : 'Доступен'}
                    </span>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSlot(slot.id)}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        slot.isActive 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {slot.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Удалить"
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

      {/* Модальное окно создания/редактирования */}
      {(showCreateModal || editingSlot) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSlot ? 'Редактировать слот' : 'Создать слот'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимальная вместимость
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (в рублях)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Активен
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingSlot(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={editingSlot ? handleEditSlot : handleCreateSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingSlot ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
