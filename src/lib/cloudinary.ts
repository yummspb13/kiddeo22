// src/lib/cloudinary.ts - Интеграция с Cloudinary
import { v2 as cloudinary } from 'cloudinary'

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkbh2wihq',
  api_key: process.env.CLOUDINARY_API_KEY || '246521541339249',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ps0PRzY_Mxex1Kfl0OutqaH-98o',
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface CloudinaryUploadOptions {
  folder?: string
  transformation?: any
  resource_type?: 'image' | 'video' | 'raw'
  public_id?: string
}

// Загрузка файла в Cloudinary
export async function uploadToCloudinary(
  file: File | Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Конвертируем File в Buffer если нужно
    let buffer: Buffer
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      buffer = file
    }

    // Настройки загрузки
    const uploadOptions = {
      folder: options.folder || 'kiddeo',
      resource_type: options.resource_type || 'image',
      public_id: options.public_id,
      transformation: options.transformation || [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }

    // Загружаем в Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            })
          } else {
            reject(new Error('No result from Cloudinary'))
          }
        }
      ).end(buffer)
    })

    console.log('✅ Cloudinary upload successful:', result.public_id)
    return result

  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error)
    throw error
  }
}

// Удаление файла из Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('✅ Cloudinary delete successful:', publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('❌ Cloudinary delete failed:', error)
    return false
  }
}

// Получение URL изображения с трансформациями
export function getCloudinaryUrl(
  publicId: string,
  transformations: any[] = []
): string {
  return cloudinary.url(publicId, {
    transformation: transformations
  })
}

// Оптимизированные трансформации для разных случаев
export const cloudinaryTransformations = {
  // Аватары пользователей
  avatar: [
    { width: 200, height: 200, crop: 'fill', gravity: 'face' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  // Изображения событий
  event: [
    { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  // Изображения мест
  venue: [
    { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  // Миниатюры
  thumbnail: [
    { width: 300, height: 200, crop: 'fill', gravity: 'auto' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  // Документы (без изменения размера)
  document: [
    { quality: 'auto', fetch_format: 'auto' }
  ]
}

// Проверка конфигурации Cloudinary
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_SECRET
  )
}

// Получение статистики использования
export async function getCloudinaryStats(): Promise<any> {
  try {
    const result = await cloudinary.api.resources({
      max_results: 1,
      type: 'upload'
    })
    return {
      totalResources: result.total_count,
      usedStorage: result.total_count * 1000000, // Примерная оценка
      limit: 25000000000 // 25GB в байтах
    }
  } catch (error) {
    console.error('Error getting Cloudinary stats:', error)
    return null
  }
}

export default cloudinary
