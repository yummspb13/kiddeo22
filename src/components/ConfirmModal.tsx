'use client'

import { X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Отмена',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          cancel: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }
      case 'info':
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }
      default:
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          cancel: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }
    }
  }

  const buttonStyles = getButtonStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-white/20 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles.cancel}`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
