import { NextRequest, NextResponse } from 'next/server';
import { sqliteOptimizer } from '@/lib/sqlite-optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    if (action === 'stats') {
      const stats = await sqliteOptimizer.getDatabaseStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    } else if (action === 'optimize') {
      const result = await sqliteOptimizer.optimizeDatabase();
      return NextResponse.json({
        success: result.success,
        data: result,
      });
    } else if (action === 'cleanup') {
      const daysToKeep = parseInt(searchParams.get('days') || '30');
      const deletedCount = await sqliteOptimizer.cleanupOldLogs(daysToKeep);
      return NextResponse.json({
        success: true,
        data: {
          deletedLogs: deletedCount,
          daysKept: daysToKeep,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Optimize API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, daysToKeep = 30 } = body;

    if (action === 'optimize') {
      const result = await sqliteOptimizer.optimizeDatabase();
      return NextResponse.json({
        success: result.success,
        data: result,
      });
    } else if (action === 'cleanup') {
      const deletedCount = await sqliteOptimizer.cleanupOldLogs(daysToKeep);
      return NextResponse.json({
        success: true,
        data: {
          deletedLogs: deletedCount,
          daysKept: daysToKeep,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Optimize API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
