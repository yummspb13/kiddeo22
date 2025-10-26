'use client'

import { useState } from 'react'
import { Building2, User, Mail, Phone, FileText, Upload, X, Send } from 'lucide-react'

interface ClaimVenueButtonProps {
  venueId: number
  venueName: string
  onSuccess?: () => void
}

interface ClaimFormData {
  fullName: string
  email: string
  phone: string
  position: string
  document: File | null
  comment: string
}

export default function ClaimVenueButton({ venueId, venueName, onSuccess }: ClaimVenueButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<ClaimFormData>({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    document: null,
    comment: ''
  })

  const handleInputChange = (field: keyof ClaimFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Создаем FormData для отправки файла
      const submitData = new FormData()
      submitData.append('venueId', venueId.toString())
      submitData.append('fullName', formData.fullName)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('position', formData.position)
      submitData.append('comment', formData.comment)
      
      if (formData.document) {
        submitData.append('document', formData.document)
      }

      const response = await fetch('/api/listings/claim', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit claim')
      }

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        onSuccess?.()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setError(null)
    setSuccess(false)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      position: '',
      document: null,
      comment: ''
    })
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Заявка отправлена!
            </h3>
            <p className="text-gray-600 mb-4">
              Ваша заявка на клейм места "{venueName}" успешно отправлена. 
              Мы рассмотрим её в ближайшее время.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Я представитель компании
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Заявка на клейм места</h2>
                <p className="text-gray-600">{venueName}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    ФИО представителя *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ivan@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Должность *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Директор, Менеджер, Представитель"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Документ, подтверждающий полномочия
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange('document', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Доверенность, приказ о назначении, выписка из ЕГРЮЛ и т.д.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Дополнительная информация
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительная информация о компании, причина клейма и т.д."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
