import { NextResponse } from 'next/server'
import { ApiTimeoutError } from './api-timeout'

export interface ApiError {
  error: string
  code: string
  timestamp: string
  requestId?: string
}

export function handleApiError(error: unknown, context: string = 'API'): NextResponse<ApiError> {
  console.error(`[${context}] Error:`, error)
  
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  if (error instanceof ApiTimeoutError) {
    console.error(`[${context}] Timeout error:`, error.message)
    return NextResponse.json(
      {
        error: 'Сервер перегружен, попробуйте позже',
        code: 'TIMEOUT',
        timestamp,
        requestId
      },
      { status: 408 }
    )
  }
  
  if (error instanceof Error) {
    // Проверяем на специфические ошибки базы данных
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return NextResponse.json(
        {
          error: 'База данных перегружена, попробуйте позже',
          code: 'DB_TIMEOUT',
          timestamp,
          requestId
        },
        { status: 503 }
      )
    }
    
    if (error.message.includes('connection') || error.message.includes('CONNECTION')) {
      return NextResponse.json(
        {
          error: 'Ошибка подключения к базе данных',
          code: 'DB_CONNECTION',
          timestamp,
          requestId
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        error: error.message || 'Внутренняя ошибка сервера',
        code: 'INTERNAL_ERROR',
        timestamp,
        requestId
      },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    {
      error: 'Неизвестная ошибка',
      code: 'UNKNOWN_ERROR',
      timestamp,
      requestId
    },
    { status: 500 }
  )
}

// Декоратор для API роутов с автоматической обработкой ошибок
export function withApiErrorHandler(
  handler: (request: Request, context: any) => Promise<NextResponse>
) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, 'API_ROUTE')
    }
  }
}
