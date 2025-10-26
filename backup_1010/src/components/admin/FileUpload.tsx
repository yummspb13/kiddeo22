'use client'

import { useState, useRef } from 'react'
import { Image, Upload, X } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string
  accept?: string
  maxSize?: number // в MB
  targetInputId?: string // ID поля input для автоматического заполнения
}

export default function FileUpload({ 
  onUpload, 
  currentUrl, 
  accept = "image/*",
  maxSize = 5,
  targetInputId = "imageUrl"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Проверяем тип файла
    if (accept === "image/*" && !file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Размер файла должен быть меньше ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setUploadedUrl(result.url)
        setUploadSuccess(true)
        onUpload(result.url)
        
        // URL передается через onUpload callback
        
        // Убираем индикатор успеха через 3 секунды
        setTimeout(() => setUploadSuccess(false), 3000)
      } else {
        const error = await response.json()
        alert(`Ошибка загрузки: ${error.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemove = () => {
    setUploadedUrl(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Индикатор успешной загрузки */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 flex items-center">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Файл успешно загружен! Изображение готово к использованию.
          </p>
        </div>
      )}

      {/* Превью загруженного изображения */}
      {uploadedUrl && (
        <div className="relative">
          <img 
            src={uploadedUrl} 
            alt="Предварительный просмотр" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Область загрузки */}
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <>
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Загрузить файл</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">или перетащите сюда</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF до {maxSize}MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
