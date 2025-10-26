'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import { optimizeImages, validateImage, formatFileSize, shouldOptimizeImage } from '@/lib/image-optimization'

interface OptimizedImage {
  file: File
  preview: string
  optimized: boolean
  originalSize: number
  optimizedSize: number
  compressionRatio: number
}

interface BatchImageUploaderProps {
  maxImages?: number
  onImagesChange: (images: OptimizedImage[]) => void
  existingImages?: OptimizedImage[]
  className?: string
  disabled?: boolean
}

export default function BatchImageUploader({
  maxImages = 4,
  onImagesChange,
  existingImages = [],
  className = '',
  disabled = false
}: BatchImageUploaderProps) {
  const [images, setImages] = useState<OptimizedImage[]>(existingImages)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setErrors([])
    setIsOptimizing(true)

    try {
      const newFiles = Array.from(files)
      
      // Проверяем количество изображений
      if (images.length + newFiles.length > maxImages) {
        setErrors([`Максимальное количество изображений: ${maxImages}`])
        setIsOptimizing(false)
        return
      }

      // Валидируем файлы
      const validationErrors: string[] = []
      const validFiles: File[] = []

      for (const file of newFiles) {
        const validation = validateImage(file)
        if (validation.valid) {
          validFiles.push(file)
        } else {
          validationErrors.push(`${file.name}: ${validation.error}`)
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setIsOptimizing(false)
        return
      }

      // Оптимизируем изображения
      const optimizedImages = await optimizeImages(validFiles, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'webp'
      })

      // Добавляем к существующим изображениям
      const newImages = [...images, ...optimizedImages]
      setImages(newImages)
      onImagesChange(newImages)

    } catch (error) {
      setErrors([`Ошибка при обработке изображений: ${error}`])
    } finally {
      setIsOptimizing(false)
    }
  }, [images, maxImages, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const openFileDialog = useCallback(() => {
    if (disabled || isOptimizing) return
    fileInputRef.current?.click()
  }, [disabled, isOptimizing])

  const canAddMore = images.length < maxImages && !isOptimizing

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Загрузчик */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
            ${isOptimizing ? 'border-blue-400 bg-blue-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          
          {isOptimizing ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-sm text-blue-600 font-medium">
                Оптимизируем изображения...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Перетащите изображения сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  До {maxImages - images.length} изображений • JPEG, PNG, WebP, GIF
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ошибки */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Изображения */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Кнопка удаления */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Индикатор оптимизации */}
              {image.optimized && (
                <div className="absolute top-2 left-2">
                  <div className="flex items-center space-x-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" />
                    <span>-{image.compressionRatio}%</span>
                  </div>
                </div>
              )}

              {/* Информация о размере */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  <div className="flex justify-between">
                    <span>Было: {formatFileSize(image.originalSize)}</span>
                    <span>Стало: {formatFileSize(image.optimizedSize)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Статистика */}
      {images.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Изображений: {images.length}/{maxImages}</span>
            <span>
              Общий размер: {formatFileSize(
                images.reduce((sum, img) => sum + img.optimizedSize, 0)
              )}
            </span>
          </div>
          {images.some(img => img.optimized) && (
            <div className="text-green-600">
              Экономия места: {formatFileSize(
                images.reduce((sum, img) => sum + (img.originalSize - img.optimizedSize), 0)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
