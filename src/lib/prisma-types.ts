import { Prisma } from '@prisma/client'

// Базовые типы для API responses
export type ApiResponse<T = any> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

// Типы для OrderItem с правильными include
export type OrderItemWithListing = Prisma.OrderItemGetPayload<{
  include: {
    EventTicketType: {
      select: {
        id: true
        name: true
        price: true
        currency: true
      }
    }
  }
}>

// Типы для Order с OrderItems
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: {
        EventTicketType: {
          select: {
            id: true
            name: true
            price: true
          }
        }
      }
    }
  }
}>

// Типы для Listing с правильными include
export type ListingWithTags = Prisma.ListingGetPayload<{
  include: {
    tags: {
      select: {
        name: true
      }
    }
    _count: {
      select: {
        Review: true
        bookings: true
      }
    }
  }
}>

// Типы для Review с user
export type ReviewWithUser = Prisma.EventReviewGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        image: true
      }
    }
  }
}>

// Типы для VenueVendor с правильными include
export type VenueVendorWithDetails = Prisma.VenueVendorGetPayload<{
  include: {
    vendor: {
      include: {
        city: true
      }
    }
    users: {
      include: {
        user: true
      }
    }
    documentsCheckedByUser: true
  }
}>

// Типы для UserChild
export type UserChildWithDetails = Prisma.UserChildGetPayload<{
  include: {
    User: {
      select: {
        id: true
        name: true
        email: true
      }
    }
  }
}>

// Утилиты для создания where условий
export const createWhereCondition = <T extends Record<string, any>>(
  baseWhere: T,
  additionalConditions: Partial<T>
): T => {
  return { ...baseWhere, ...additionalConditions }
}

// Утилиты для безопасного доступа к свойствам
export const safeGet = <T, K extends keyof T>(obj: T, key: K): T[K] | undefined => {
  try {
    return obj[key]
  } catch {
    return undefined
  }
}

// Типы для FormData
export type FormDataField = string | File | null

export const parseFormDataField = (value: FormDataField): string | null => {
  if (value === null) return null
  if (typeof value === 'string') return value
  if (value instanceof File) return value.name
  return null
}

// Типы для API routes params
export type ApiRouteParams = {
  params: Promise<Record<string, string>>
}

// Утилиты для преобразования типов
export const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

export const toString = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  return String(value)
}

// Типы для Prisma include операций
export type PrismaInclude<T> = T extends { include: infer I } ? I : never

// Утилиты для работы с Prisma where
export const createPrismaWhere = <T extends Record<string, any>>(
  conditions: T
): T => {
  return conditions
}

// Типы для ошибок API
export type ApiError = {
  error: string
  message?: string
  status: number
}

// Утилиты для создания API ответов
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
})

export const createErrorResponse = (error: string, status: number = 500): ApiError => ({
  error,
  status
})

// Типы для работы с файлами
export type FileUpload = {
  file: File
  fileName: string
  filePath: string
  size: number
}

export const createFileUpload = (file: File, prefix: string = 'upload'): FileUpload => {
  const timestamp = Date.now()
  const fileName = `${prefix}-${timestamp}-${file.name}`
  const filePath = `uploads/${fileName}`
  
  return {
    file,
    fileName,
    filePath,
    size: file.size
  }
}
