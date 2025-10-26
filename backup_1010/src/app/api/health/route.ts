import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Проверяем подключение к базе данных
    await prisma.$queryRaw`SELECT 1`;
    
    const duration = Date.now() - startTime;
    
    const response = NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        responseTime: duration,
      },
      memory: process.memoryUsage(),
      version: process.version,
    });

    // Логирование отключено для диагностики

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const response = NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime: duration,
      },
      memory: process.memoryUsage(),
      version: process.version,
    }, { status: 500 });

    // Логирование отключено для диагностики

    return response;
  }
}