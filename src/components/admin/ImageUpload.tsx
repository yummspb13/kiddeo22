'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
}

export default function ImageUpload({ 
  value, 
  onChange, 
  placeholder = "Выберите изображение",
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Обновляем preview при изменении value
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    setUploading(true)

    try {
      // Создаем FormData для загрузки
      const formData = new FormData()
      formData.append('file', file)

      // Загружаем файл
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const data = await response.json()
      
      // Обновляем состояние
      setPreview(data.url)
      onChange(data.url)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Поле для URL (показывается только если нет изображения) */}
      {!preview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Или введите URL изображения
          </label>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value)
              setPreview(e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {/* Кнопка загрузки */}
      <div>
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full mr-2"></div>
              Загрузка...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {preview ? 'Заменить изображение' : 'Загрузить файл'}
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Превью изображения */}
      {preview && (
        <div className="space-y-3">
          <div className="relative">
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => {
                  setPreview(null)
                  onChange('')
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Кнопка для ввода URL */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                onChange('')
              }}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Ввести URL вместо файла
            </button>
          </div>
        </div>
      )}

      {/* Информация о файле */}
      <div className="text-xs text-gray-500">
        <p>• Поддерживаемые форматы: JPG, PNG, GIF, WebP</p>
        <p>• Максимальный размер: 5MB</p>
        <p>• Рекомендуемый размер: 1200x630px</p>
      </div>
    </div>
  )
}
