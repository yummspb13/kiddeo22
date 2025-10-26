"use client"

import { X, AlertTriangle } from 'lucide-react'

interface ConfirmExitModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmExitModal({ isOpen, onConfirm, onCancel }: ConfirmExitModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-unbounded-bold text-gray-900">Подтверждение выхода</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 font-unbounded-regular">
            Точно хотите выйти? Несохраненные изменения будут потеряны.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-unbounded-medium transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-unbounded-medium transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
