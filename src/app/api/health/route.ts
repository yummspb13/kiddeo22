import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const runtime = 'nodejs'

// Кэш для health check на 10 секунд
let healthCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 10 * 1000; // 10 секунд

export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Проверяем кэш
  if (healthCache && (now - healthCache.timestamp) < CACHE_DURATION) {
    return NextResponse.json(healthCache.data);
  }
  
  const startTime = Date.now();
  
  try {
    // Простая проверка подключения к базе данных с таймаутом
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 1000)
      )
    ]);
    
    const duration = Date.now() - startTime;
    
    const responseData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        responseTime: duration,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: process.version,
    };

    // Сохраняем в кэш
    healthCache = {
      data: responseData,
      timestamp: now
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const responseData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime: duration,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: process.version,
    };

    return NextResponse.json(responseData, { status: 500 });
  }
}