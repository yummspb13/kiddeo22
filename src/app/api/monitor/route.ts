import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'memory';

    if (type === 'memory') {
      // Простая статистика без базы данных
      const response = NextResponse.json({
        success: true,
        data: {
          logs: [],
          stats: {
            totalRequests: 0,
            averageDuration: 0,
            errorRate: 0,
            statusCodes: {},
            slowestRoutes: []
          },
          source: 'memory',
          timestamp: new Date().toISOString(),
        },
      });

      return response;
    } else if (type === 'database') {
      // Простая статистика базы данных
      const response = NextResponse.json({
        success: true,
        data: {
          totalRequests: 0,
          averageDuration: 0,
          errorRate: 0,
          statusCodes: {},
          slowestRoutes: [],
          source: 'database',
          timestamp: new Date().toISOString(),
        },
      });

      return response;
    } else if (type === 'health') {
      // Проверка здоровья системы
      const response = NextResponse.json({
        success: true,
        data: {
          memory: {
            totalRequests: 0,
            averageDuration: 0,
            errorRate: 0,
            statusCodes: {},
            slowestRoutes: []
          },
          database: {
            totalRequests: 0,
            averageDuration: 0,
            errorRate: 0,
            statusCodes: {},
            slowestRoutes: []
          },
          health: {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
          },
        },
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Monitor API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}