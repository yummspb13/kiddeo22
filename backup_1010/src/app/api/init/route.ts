import { NextRequest, NextResponse } from 'next/server';
import { initializeLoggingSystem, checkSystemHealth } from '@/lib/init-logging';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    if (action === 'health') {
      const health = await checkSystemHealth();
      return NextResponse.json({
        success: true,
        data: health,
      });
    } else if (action === 'init') {
      const result = await initializeLoggingSystem();
      return NextResponse.json({
        success: result.success,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Init API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'init') {
      const result = await initializeLoggingSystem();
      return NextResponse.json({
        success: result.success,
        data: result,
      });
    } else if (action === 'health') {
      const health = await checkSystemHealth();
      return NextResponse.json({
        success: true,
        data: health,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Init API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
