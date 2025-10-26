"use client"

import { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import ConfirmExitModal from './ConfirmExitModal'

interface BankAccount {
  bankName: string
  bik: string
  account: string
}

interface EditBankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BankAccount) => Promise<void>
  initialData?: BankAccount
}

export default function EditBankAccountModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EditBankAccountModalProps) {
  const [formData, setFormData] = useState<BankAccount>({
    bankName: '',
    bik: '',
    account: ''
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

  const handleInputChange = (field: keyof BankAccount, value: string) => {
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
          <h2 className="text-2xl font-unbounded-bold text-gray-900">Банковские реквизиты</h2>
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
          {/* Банк */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              Наименование банка *
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-unbounded-regular"
              placeholder="Введите наименование банка"
              required
            />
          </div>

          {/* БИК */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              БИК банка *
            </label>
            <input
              type="text"
              value={formData.bik}
              onChange={(e) => handleInputChange('bik', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-unbounded-regular"
              placeholder="Введите БИК банка"
              required
            />
          </div>

          {/* Расчетный счет */}
          <div>
            <label className="block text-sm font-unbounded-medium text-gray-700 mb-2">
              Расчетный счет *
            </label>
            <input
              type="text"
              value={formData.account}
              onChange={(e) => handleInputChange('account', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-unbounded-regular"
              placeholder="Введите расчетный счет"
              required
            />
          </div>


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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-unbounded-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
