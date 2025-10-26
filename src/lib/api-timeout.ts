// Глобальная защита от зависания API
export class ApiTimeoutError extends Error {
  constructor(message: string = 'API timeout') {
    super(message)
    this.name = 'ApiTimeoutError'
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ApiTimeoutError(errorMessage || `Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Обертка для fetch с таймаутом
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`)
    }
    
    throw error
  }
}

// Обертка для Prisma запросов с таймаутом
export function withPrismaTimeout<T>(
  prismaPromise: Promise<T>,
  timeoutMs: number = 8000
): Promise<T> {
  return withTimeout(prismaPromise, timeoutMs, 'Database operation timeout')
}
