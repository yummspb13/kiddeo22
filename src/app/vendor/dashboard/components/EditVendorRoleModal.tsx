"use client"

import { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import ConfirmExitModal from './ConfirmExitModal'

interface VendorRole {
  role: 'NPD' | 'IE' | 'LEGAL'
  fullName?: string
  inn?: string
  orgnip?: string
  orgn?: string
  companyName?: string
  directorName?: string
}

interface EditVendorRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VendorRole) => Promise<void>
  initialData?: VendorRole
}

export default function EditVendorRoleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EditVendorRoleModalProps) {
  const [formData, setFormData] = useState<VendorRole>({
    role: 'NPD',
    fullName: '',
    inn: '',
    orgnip: '',
    orgn: '',
    companyName: '',
    directorName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VendorRole, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmExit(true)
    } else {
      onClose()
    }
  }

  const handleConfirmExit = () => {
    setShowConfirmExit(false)
    onClose()
  }

  const handleCancelExit = () => {
    setShowConfirmExit(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-unbounded-bold text-gray-900">Редактировать роль вендора</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-unbounded-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Тип роли */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              Тип роли *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as 'NPD' | 'IE' | 'LEGAL')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
              required
            >
              <option value="NPD">Самозанятый</option>
              <option value="IE">Индивидуальный предприниматель</option>
              <option value="LEGAL">Юридическое лицо</option>
            </select>
          </div>

          {/* ФИО */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              {formData.role === 'LEGAL' ? 'ФИО ответственного' : 'ФИО'} *
            </label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
              placeholder={formData.role === 'LEGAL' ? 'Введите ФИО ответственного лица' : 'Введите ФИО'}
              required
            />
          </div>

          {/* ИНН */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              ИНН *
            </label>
            <input
              type="text"
              value={formData.inn || ''}
              onChange={(e) => handleInputChange('inn', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
              placeholder="Введите ИНН"
              required
            />
          </div>

          {/* ОГРНИП (для ИП) */}
          {formData.role === 'IE' && (
            <div>
              <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
                ОГРНИП *
              </label>
              <input
                type="text"
                value={formData.orgnip || ''}
                onChange={(e) => handleInputChange('orgnip', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
                placeholder="Введите ОГРНИП"
                required
              />
            </div>
          )}

          {/* ОГРН и название компании (для ЮЛ) */}
          {formData.role === 'LEGAL' && (
            <>
              <div>
                <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
                  ОГРН *
                </label>
                <input
                  type="text"
                  value={formData.orgn || ''}
                  onChange={(e) => handleInputChange('orgn', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
                  placeholder="Введите ОГРН"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
                  Название компании *
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
                  placeholder="Введите название компании"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
                  ФИО директора *
                </label>
                <input
                  type="text"
                  value={formData.directorName || ''}
                  onChange={(e) => handleInputChange('directorName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular"
                  placeholder="Введите ФИО директора"
                  required
                />
              </div>
            </>
          )}

          {/* Кнопки */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-unbounded-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <ConfirmExitModal
        isOpen={showConfirmExit}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  )
}
