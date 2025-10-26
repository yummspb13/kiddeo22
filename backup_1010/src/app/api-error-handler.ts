import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/error-handler'

// Обертка для API маршрутов с обработкой ошибок
export function withApiErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('🚨 Unhandled API error:', error)
      
      const errorResponse = handleApiError(error, 'API Route')
      
      return NextResponse.json(errorResponse, { 
        status: errorResponse.statusCode || 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
  }
}

// Middleware для обработки ошибок в API маршрутах
export function apiErrorMiddleware(handler: Function) {
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('🚨 API Middleware error:', error)
      
      const errorResponse = handleApiError(error, 'API Middleware')
      
      return NextResponse.json(errorResponse, { 
        status: errorResponse.statusCode || 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
  }
}
