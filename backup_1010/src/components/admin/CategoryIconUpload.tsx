'use client'

import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface CategoryIconUploadProps {
  onUpload: (url: string) => void
  currentIcon?: string
  categoryName?: string
}

export default function CategoryIconUpload({ 
  onUpload, 
  currentIcon, 
  categoryName 
}: CategoryIconUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB')
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'category-icons')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const data = await response.json()
      onUpload(data.url)
      setUploadSuccess(true)

      // Убираем индикатор успеха через 3 секунды
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Иконка категории
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Рекомендуемый размер: 64x64px, формат: PNG, SVG, JPG. Максимум 2MB.
        </p>
      </div>

      {/* Область загрузки */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Загружаем...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center">
            <Check className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-green-600 font-medium">Иконка загружена!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Перетащите изображение сюда или нажмите для выбора
            </p>
            <p className="text-xs text-gray-500">
              PNG, SVG, JPG до 2MB
            </p>
          </div>
        )}
      </div>

      {/* Текущая иконка */}
      {currentIcon && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Текущая иконка:</p>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={currentIcon}
                alt={categoryName || 'Иконка категории'}
                width={64}
                height={64}
                className="object-contain category-icon"
                style={{ 
                  backgroundColor: 'transparent',
                  background: 'transparent',
                  mixBlendMode: 'normal'
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Размер: 64x64px</p>
              <p className="text-xs text-gray-500 truncate">
                {currentIcon.split('/').pop()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Рекомендации по иконкам:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Используйте простые, узнаваемые символы</li>
          <li>• Избегайте сложных деталей (иконка будет маленькой)</li>
          <li>• Лучше всего подходят SVG или PNG с прозрачным фоном</li>
          <li>• Цвет должен соответствовать тематике категории</li>
        </ul>
      </div>
    </div>
  )
}
