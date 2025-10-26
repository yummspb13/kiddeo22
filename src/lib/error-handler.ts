// Глобальный обработчик ошибок для API
export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    // Сохраняем стек вызовов
    Error.captureStackTrace(this, this.constructor)
  }
}

// Обработчик ошибок для API маршрутов
export function handleApiError(error: unknown, context: string = 'Unknown') {
  console.error(`❌ API Error in ${context}:`, error)
  
  // Если это наша кастомная ошибка
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      context
    }
  }
  
  // Если это ошибка валидации Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    switch (prismaError.code) {
      case 'P2002':
        return {
          success: false,
          error: 'Данные уже существуют',
          statusCode: 409,
          context
        }
      case 'P2025':
        return {
          success: false,
          error: 'Запись не найдена',
          statusCode: 404,
          context
        }
      case 'P2003':
        return {
          success: false,
          error: 'Нарушение внешнего ключа',
          statusCode: 400,
          context
        }
      default:
        return {
          success: false,
          error: 'Ошибка базы данных',
          statusCode: 500,
          context
        }
    }
  }
  
  // Общая ошибка
  return {
    success: false,
    error: 'Внутренняя ошибка сервера',
    statusCode: 500,
    context,
    details: process.env.NODE_ENV === 'development' ? 
      (error instanceof Error ? error.message : String(error)) : 
      undefined
  }
}

// Обертка для API маршрутов с обработкой ошибок
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      const errorResponse = handleApiError(error, context)
      
      // Если это NextResponse, возвращаем его
      if (errorResponse && 'json' in errorResponse) {
        return errorResponse as R
      }
      
      // Иначе создаем NextResponse
      const { NextResponse } = require('next/server')
      return NextResponse.json(errorResponse, { 
        status: errorResponse.statusCode || 500 
      }) as R
    }
  }
}

// Безопасное выполнение операций
export async function safeExecute<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string = 'Unknown'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`❌ Safe execute error in ${context}:`, error)
    return fallback
  }
}
