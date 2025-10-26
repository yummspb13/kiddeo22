'use client'

import { useNotifications } from '@/hooks/useNotifications'

export default function TestNotificationsSimplePage() {
  const { showSuccess, showError, showInfo } = useNotifications()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Простой тест уведомлений</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Тестирование уведомлений</h2>
          <p className="text-gray-600 mb-6">
            Уведомления должны появляться в правом верхнем углу экрана, ниже хедера (top-35).
            Используется улучшенный дизайн с шрифтом Unbounded и декоративными элементами.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => showSuccess('Успех!', 'Это уведомление об успехе')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Показать успех
            </button>
            
            <button
              onClick={() => showError('Ошибка!', 'Это уведомление об ошибке')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Показать ошибку
            </button>
            
            <button
              onClick={() => showInfo('Информация', 'Это информационное уведомление')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Показать информацию
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Инструкции:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Уведомления должны появляться в правом верхнем углу</li>
              <li>• Используется улучшенный дизайн с декоративными элементами</li>
              <li>• Шрифт Unbounded для всех текстов</li>
              <li>• Позиция: top-35 (ниже хедера), right-4</li>
              <li>• Z-index: 9999 (высший приоритет)</li>
              <li>• Автоматически исчезают через 4-6 секунд</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
