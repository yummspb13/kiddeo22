/**
 * Утилиты для оптимизации изображений
 */

interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

interface OptimizedImage {
  file: File
  preview: string
  optimized: boolean
  originalSize: number
  optimizedSize: number
  compressionRatio: number
}

/**
 * Оптимизирует изображение
 */
export async function optimizeImage(
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Устанавливаем размеры canvas
        canvas.width = width
        canvas.height = height

        // Рисуем изображение на canvas
        ctx?.drawImage(img, 0, 0, width, height)

        // Конвертируем в выбранный формат
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Не удалось оптимизировать изображение'))
              return
            }

            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${format}`), {
              type: `image/${format}`,
              lastModified: Date.now()
            })

            // Создаем preview
            const preview = canvas.toDataURL(`image/${format}`, quality)

            resolve({
              file: optimizedFile,
              preview,
              optimized: true,
              originalSize: file.size,
              optimizedSize: optimizedFile.size,
              compressionRatio: Math.round((1 - optimizedFile.size / file.size) * 100)
            })
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Не удалось загрузить изображение'))
    }

    // Загружаем изображение
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Оптимизирует массив изображений
 */
export async function optimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage[]> {
  const promises = files.map(file => optimizeImage(file, options))
  return Promise.all(promises)
}

/**
 * Проверяет, нужно ли оптимизировать изображение
 */
export function shouldOptimizeImage(file: File): boolean {
  const maxSize = 2 * 1024 * 1024 // 2MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  return file.size > maxSize || !allowedTypes.includes(file.type)
}

/**
 * Получает размер файла в читаемом формате
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Валидирует изображение
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP, GIF'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: ${formatFileSize(maxSize)}`
    }
  }
  
  return { valid: true }
}
