import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  ApiResponse, 
  createSuccessResponse, 
  createErrorResponse,
  toNumber,
  toString,
  parseFormDataField
} from './prisma-types'

// Утилиты для работы с параметрами API routes
export const getRouteParams = async (params: Promise<Record<string, string>>) => {
  return await params
}

// Утилиты для работы с query параметрами
export const getQueryParams = (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  return {
    get: (key: string) => searchParams.get(key),
    getAll: (key: string) => searchParams.getAll(key),
    has: (key: string) => searchParams.has(key)
  }
}

// Утилиты для работы с body
export const getRequestBody = async <T = any>(request: NextRequest): Promise<T> => {
  const contentType = request.headers.get('content-type') || ''
  
  if (contentType.includes('application/json')) {
    return await request.json()
  }
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const body: any = {}
    
    for (const [key, value] of formData.entries()) {
      body[key] = parseFormDataField(value)
    }
    
    return body
  }
  
  return {} as T
}

// Утилиты для работы с Prisma where условиями
export const createWhereCondition = <T extends Record<string, any>>(
  baseWhere: T,
  additionalConditions: Partial<T>
): T => {
  return { ...baseWhere, ...additionalConditions }
}

// Утилиты для работы с Prisma include
export const createIncludeCondition = <T extends Record<string, any>>(
  include: T
): T => {
  return include
}

// Утилиты для работы с Prisma select
export const createSelectCondition = <T extends Record<string, any>>(
  select: T
): T => {
  return select
}

// Утилиты для работы с числами
export const safeParseInt = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

export const safeParseFloat = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

// Утилиты для работы со строками
export const safeString = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  return String(value)
}

// Утилиты для работы с булевыми значениями
export const safeBoolean = (value: string | boolean | null | undefined): boolean | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value
  return value === 'true' || value === '1'
}

// Утилиты для работы с датами
export const safeDate = (value: string | Date | null | undefined): Date | null => {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

// Утилиты для работы с массивами
export const safeArray = <T>(value: T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : []
}

// Утилиты для работы с объектами
export const safeObject = <T extends Record<string, any>>(
  value: T | null | undefined,
  defaultValue: T
): T => {
  if (value === null || value === undefined) return defaultValue
  return typeof value === 'object' ? value : defaultValue
}

// Утилиты для работы с fetch запросами
export const safeFetch = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      return {
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
    
    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Утилиты для создания API ответов
export const createApiResponse = <T>(data: T, status: number = 200): NextResponse => {
  return NextResponse.json(createSuccessResponse(data), { status })
}

export const createApiError = (error: string, status: number = 500): NextResponse => {
  return NextResponse.json(createErrorResponse(error, status), { status })
}

// Утилиты для работы с Prisma операциями
export const safePrismaOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error(errorMessage, error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : errorMessage 
    }
  }
}

// Утилиты для работы с файлами
export const handleFileUpload = async (
  formData: FormData,
  fieldName: string,
  prefix: string = 'upload'
): Promise<{ fileName: string; filePath: string } | null> => {
  const file = formData.get(fieldName) as File
  if (!file || file.size === 0) return null
  
  const timestamp = Date.now()
  const fileName = `${prefix}-${timestamp}-${file.name}`
  const filePath = `uploads/${fileName}`
  
  // Здесь должна быть логика сохранения файла
  // Пока просто возвращаем пути
  
  return { fileName, filePath }
}

// Утилиты для валидации
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  return null
}

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Invalid phone format'
  }
  return null
}

// Утилиты для работы с пагинацией
export const getPaginationParams = (request: NextRequest) => {
  const query = getQueryParams(request)
  const page = safeParseInt(query.get('page')) || 1
  const limit = safeParseInt(query.get('limit')) || 10
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

// Утилиты для работы с сортировкой
export const getSortParams = (request: NextRequest) => {
  const query = getQueryParams(request)
  const sortBy = query.get('sortBy') || 'createdAt'
  const sortOrder = query.get('sortOrder') || 'desc'
  
  return { sortBy, sortOrder }
}

// Утилиты для работы с фильтрами
export const getFilterParams = (request: NextRequest) => {
  const query = getQueryParams(request)
  const filters: Record<string, any> = {}
  
  // Добавляем все query параметры как фильтры
  for (const [key, value] of query.getAll('')) {
    if (value) {
      filters[key] = value
    }
  }
  
  return filters
}