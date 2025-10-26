import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET: получить аналитику места (публичный доступ для тестирования)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id);
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Вычисляем даты для периода
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Для демонстрации создаем тестовые данные
    const totalViews = 1250;
    const totalClicks = 89;
    const totalConversions = 12;
    const avgTimeOnPage = 145;

    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    const trafficSourcesArray = [
      { source: 'google.com', views: 450, clicks: 32, conversions: 5, percentage: 36 },
      { source: 'yandex.ru', views: 380, clicks: 28, conversions: 4, percentage: 30.4 },
      { source: 'direct', views: 320, clicks: 20, conversions: 2, percentage: 25.6 },
      { source: 'vk.com', views: 100, clicks: 9, conversions: 1, percentage: 8 }
    ];

    // Создаем тестовые данные для графика за последние 7 дней
    const chartDataArray = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayViews = Math.floor(Math.random() * 200) + 100;
      const dayClicks = Math.floor(dayViews * 0.07);
      const dayConversions = Math.floor(dayClicks * 0.15);
      const dayTimeOnPage = Math.floor(Math.random() * 60) + 120;
      
      chartDataArray.push({
        date: date.toISOString().split('T')[0],
        views: dayViews,
        clicks: dayClicks,
        conversions: dayConversions,
        timeOnPage: dayTimeOnPage
      });
    }

    const result = {
      venue: {
        id: venueId,
        name: 'Test Venue',
        tariff: 'SUPER'
      },
      period: {
        from: startDate.toISOString(),
        to: now.toISOString(),
        days: Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalViews,
        totalClicks,
        totalConversions,
        avgTimeOnPage,
        conversionRate,
        clickThroughRate
      },
      trafficSources: trafficSourcesArray,
      chartData: chartDataArray
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('GET /api/public/venues/[id]/analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
