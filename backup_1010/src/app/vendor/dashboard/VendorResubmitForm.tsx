"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'

interface Vendor {
  id: number
  displayName: string
  cityId: number
  description?: string
  phone?: string
  email?: string
  website?: string
  supportEmail?: string
  supportPhone?: string
  brandSlug?: string
  proofType?: 'DOMAIN_EMAIL' | 'DNS_RECORD' | 'LETTER' | 'PHOTO'
  proofData?: string
  additionalProofData?: string
  agreements?: unknown
  city: {
    id: number
    name: string
  }
  vendorRole?: {
    moderatorNotes?: string
    moderatedAt?: string
    moderator?: {
      name?: string
      email: string
    }
  }
}

interface City {
  id: number
  name: string
  slug: string
}

interface VendorResubmitFormProps {
  vendor: Vendor
  cities: City[]
  onClose: () => void
}

export default function VendorResubmitForm({ vendor, cities, onClose }: VendorResubmitFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Состояние формы
  const [formData, setFormData] = useState({
    displayName: vendor.displayName || '',
    cityId: vendor.cityId || '',
    description: vendor.description || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    website: vendor.website || '',
    supportEmail: vendor.supportEmail || '',
    supportPhone: vendor.supportPhone || '',
    brandSlug: vendor.brandSlug || '',
    proofType: vendor.proofType || 'PHOTO',
    proofData: vendor.proofData || '',
    additionalProofData: vendor.additionalProofData || '',
    agreements: vendor.agreements || { pdn: false, tos: false, brandRights: false }
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...(prev as any),
        agreements: {
          ...(prev as any).agreements,
          [name]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/vendor/upload-document', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedDocumentId(data.document.id)
        setFormData(prev => ({
          ...prev,
          proofData: data.document.fileName
        }))
      } else {
        setError(data.error || 'Ошибка при загрузке файла')
        setUploadedFile(null)
      }
    } catch (err) {
      setError('Ошибка при загрузке файла')
      setUploadedFile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/vendors/resubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.refresh()
          onClose()
        }, 2000)
      } else {
        setError(data.error || 'Ошибка при отправке заявки')
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка отправлена!</h2>
            <p className="text-gray-600 mb-6">
              Ваша заявка успешно отправлена на повторную модерацию. 
              Мы уведомим вас о результате.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Повторная отправка заявки</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Обновите информацию и отправьте заявку на повторную модерацию
          </p>
          
          {/* Комментарий модератора */}
          {vendor.vendorRole?.moderatorNotes && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Комментарий модератора:
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    {vendor.vendorRole.moderatorNotes}
                  </p>
                  {vendor.vendorRole.moderatedAt && (
                    <p className="text-xs text-yellow-600">
                      {new Date(vendor.vendorRole.moderatedAt).toLocaleString('ru-RU')}
                      {vendor.vendorRole.moderator && (
                        <span> • {vendor.vendorRole.moderator.name || vendor.vendorRole.moderator.email}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название компании *
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите название компании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <select
                name="cityId"
                value={formData.cityId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание деятельности
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Опишите вашу деятельность"
              />
            </div>
          </div>

          {/* Контактная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Контактная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="company@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email поддержки
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон поддержки
                </label>
                <input
                  type="tel"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
          </div>

          {/* Документы для подтверждения */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Документы для подтверждения</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип подтверждения *
              </label>
              <select
                name="proofType"
                value={formData.proofType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PHOTO">Фотография</option>
                <option value="LETTER">Письмо</option>
                <option value="DOMAIN_EMAIL">Email с домена</option>
                <option value="DNS_RECORD">DNS запись</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Загрузить документ *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'Нажмите для загрузки файла'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дополнительная информация
              </label>
              <textarea
                name="additionalProofData"
                value={formData.additionalProofData}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Дополнительная информация о документе"
              />
            </div>
          </div>

          {/* Согласия */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Согласия</h3>
            
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="pdn"
                  checked={(formData.agreements as any).pdn}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  Я согласен на обработку персональных данных
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="tos"
                  checked={(formData.agreements as any).tos}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  Я принимаю пользовательское соглашение
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="brandRights"
                  checked={(formData.agreements as any).brandRights}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  Я подтверждаю права на использование бренда
                </span>
              </label>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !(formData.agreements as any).pdn || !(formData.agreements as any).tos || !(formData.agreements as any).brandRights}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Отправить заявку
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
