// API Gateway для оптимизации роутов как у больших агрегаторов
import { NextRequest, NextResponse } from 'next/server'

export interface ApiRoute {
  path: string
  handler: (req: NextRequest) => Promise<NextResponse>
  method: string
  priority: number // 1 = высокий приоритет, 5 = низкий
}

class ApiGateway {
  private routes: Map<string, ApiRoute> = new Map()
  private loadedRoutes: Set<string> = new Set()

  // Регистрация роута
  register(route: ApiRoute) {
    const key = `${route.method}:${route.path}`
    this.routes.set(key, route)
  }

  // Ленивая загрузка роута
  async loadRoute(method: string, path: string): Promise<ApiRoute | null> {
    const key = `${method}:${path}`
    
    if (this.loadedRoutes.has(key)) {
      return this.routes.get(key) || null
    }

    // Динамическая загрузка только нужного роута
    try {
      const route = await this.dynamicImport(method, path)
      if (route) {
        this.loadedRoutes.add(key)
        return route
      }
    } catch (error) {
      console.error(`Failed to load route ${key}:`, error)
    }

    return null
  }

  // Динамический импорт роута
  private async dynamicImport(method: string, path: string): Promise<ApiRoute | null> {
    // Преобразуем путь в путь к файлу
    const filePath = this.pathToFilePath(path)
    
    try {
      const module = await import(`@/app/api${filePath}/route`)
      const handler = module[method.toUpperCase()]
      
      if (typeof handler === 'function') {
        return {
          path,
          handler,
          method: method.toUpperCase(),
          priority: this.getPriority(path)
        }
      }
    } catch (error) {
      // Роут не найден
      return null
    }

    return null
  }

  // Преобразование API пути в путь к файлу
  private pathToFilePath(path: string): string {
    return path.replace(/\[([^\]]+)\]/g, '[$1]')
  }

  // Определение приоритета роута
  private getPriority(path: string): number {
    // Критичные роуты - высокий приоритет
    if (path.includes('/auth/') || path.includes('/health')) return 1
    
    // Основные API - средний приоритет  
    if (path.includes('/venues/') || path.includes('/events/')) return 2
    
    // Админ роуты - низкий приоритет
    if (path.includes('/admin/')) return 4
    
    // Остальные - средний приоритет
    return 3
  }

  // Обработка запроса
  async handleRequest(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url)
    const path = url.pathname.replace('/api', '')
    const method = req.method

    // Загружаем только нужный роут
    const route = await this.loadRoute(method, path)
    
    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' }, 
        { status: 404 }
      )
    }

    try {
      return await route.handler(req)
    } catch (error) {
      console.error(`Error in route ${path}:`, error)
      return NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      )
    }
  }
}

// Глобальный экземпляр API Gateway
export const apiGateway = new ApiGateway()

// Утилита для регистрации роутов
export function registerApiRoute(route: Omit<ApiRoute, 'handler'> & { 
  handler: (req: NextRequest) => Promise<NextResponse> 
}) {
  apiGateway.register(route)
}
