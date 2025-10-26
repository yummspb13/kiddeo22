"use client"

import { useState } from "react"
import { Clock, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar } from "lucide-react"

interface Vendor {
  id: number
  displayName: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  kycStatus: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
    createdAt: string
  }
  city: {
    id: number
    name: string
  }
  VendorOnboarding: {
    step: number
    completedSteps: number[]
    isCompleted: boolean
  } | null
}

interface PendingVendorsClientProps {
  vendors: Vendor[]
}

export default function PendingVendorsClient({ vendors }: PendingVendorsClientProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleApprove = async (vendorId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/vendors/pending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorId,
          status: 'APPROVED',
          reason: reason || 'Заявка одобрена'
        })
      })

      if (response.ok) {
        // Обновляем страницу
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error approving vendor:', error)
      alert('Ошибка при одобрении вендора')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (vendorId: number) => {
    if (!reason.trim()) {
      alert('Пожалуйста, укажите причину отклонения')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/vendors/pending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorId,
          status: 'REJECTED',
          reason
        })
      })

      if (response.ok) {
        // Обновляем страницу
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error)
      alert('Ошибка при отклонении вендора')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Заявки вендоров на модерацию</h1>
          <p className="mt-2 text-gray-600">
            Проверьте и одобрите заявки новых вендоров
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На модерации</p>
                <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Одобрено сегодня</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Отклонено сегодня</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Список заявок</h2>
          </div>
          
          {vendors.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет заявок на модерацию</h3>
              <p className="mt-1 text-sm text-gray-500">
                Все заявки обработаны
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {vendor.displayName}
                        </h3>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          На модерации
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {vendor.user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {vendor.phone || 'Не указан'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {vendor.city.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(vendor.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      
                      {vendor.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {vendor.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for vendor details */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedVendor.displayName}
                  </h3>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Описание</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedVendor.description || 'Не указано'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVendor.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Телефон</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVendor.phone || 'Не указан'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Город</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVendor.city.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Дата подачи</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedVendor.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Причина (для отклонения)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Укажите причину отклонения (если применимо)"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleReject(selectedVendor.id)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Обработка...' : 'Отклонить'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVendor.id)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Обработка...' : 'Одобрить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
