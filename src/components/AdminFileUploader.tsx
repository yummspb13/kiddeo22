'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface AdminFileUploaderProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number // in MB
}

export default function AdminFileUploader({ 
  value, 
  onChange, 
  accept = 'image/*',
  maxSize = 5 
}: AdminFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError('')
    console.log('Starting file upload:', file.name, file.type, file.size)
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Размер файла не должен превышать ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'background') // Добавляем тип файла

      console.log('Sending request to /api/admin/upload')
      const response = await fetch('/api/admin/upload?key=kidsreview2025', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (result.success) {
        onChange(result.url)
        console.log('File uploaded successfully:', result.url)
      } else {
        setError(result.error || 'Ошибка загрузки файла')
        console.error('Upload failed:', result.error)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Ошибка загрузки файла')
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
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    onChange('')
    setError('')
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Нажмите на изображение или перетащите новое для замены</p>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-2">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Нажмите для загрузки
                  </span>
                  {' '}или перетащите файл сюда
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF до {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        {value ? 'Заменить изображение' : 'Выбрать изображение'}
      </button>
    </div>
  )
}
