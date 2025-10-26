import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromToken } from '@/lib/auth-session';
import { canUseFeature, type VenueTariffData } from '@/lib/tariff-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: получить аналитику места
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id);
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    // Проверяем аутентификацию
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSessionFromToken(sessionToken);
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем информацию о месте и тарифе
    const venue = await prisma.venuePartner.findFirst({
      where: { 
        id: venueId,
        vendor: {
          userId: parseInt(session.user!.id)
        }
      },
      select: {
        id: true,
        name: true,
        tariff: true,
        tariffExpiresAt: true,
        tariffGracePeriodEndsAt: true,
        newsCountThisMonth: true,
        newsResetAt: true
      }
    });

    if (!venue) {
      return NextResponse.json({ 
        error: 'Venue not found or access denied' 
      }, { status: 404 });
    }

    // Проверяем, доступна ли аналитика для тарифа
    const venueData: VenueTariffData = {
      tariff: venue.tariff as any,
      tariffExpiresAt: venue.tariffExpiresAt,
      tariffGracePeriodEndsAt: venue.tariffGracePeriodEndsAt,
      newsCountThisMonth: venue.newsCountThisMonth,
      newsResetAt: venue.newsResetAt
    };

    if (!canUseFeature(venueData, 'analytics')) {
      return NextResponse.json({ 
        error: 'Analytics feature is not available for your current tariff',
        details: 'Upgrade to SUPER or MAXIMUM tariff to view analytics'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Вычисляем даты для периода
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date = now;

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else {
      switch (period) {
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    // Получаем аналитику
    const analytics = await prisma.venueAnalytics.findMany({
      where: {
        venueId,
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      orderBy: { date: 'asc' }
    });

    // Агрегируем данные
    const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
    const totalClicks = analytics.reduce((sum, item) => sum + item.clicks, 0);
    const totalConversions = analytics.reduce((sum, item) => sum + item.conversions, 0);
    const avgTimeOnPage = analytics.length > 0 
      ? analytics.reduce((sum, item) => sum + (item.timeOnPage || 0), 0) / analytics.length 
      : 0;

    // Группируем по источникам трафика
    const trafficSources = analytics.reduce((acc, item) => {
      const source = item.referrer || 'direct';
      if (!acc[source]) {
        acc[source] = { views: 0, clicks: 0, conversions: 0 };
      }
      acc[source].views += item.views;
      acc[source].clicks += item.clicks;
      acc[source].conversions += item.conversions;
      return acc;
    }, {} as Record<string, { views: number; clicks: number; conversions: number }>);

    // Данные для графиков (по дням)
    const chartData = analytics.map(item => ({
      date: item.date.toISOString().split('T')[0],
      views: item.views,
      clicks: item.clicks,
      conversions: item.conversions,
      timeOnPage: item.timeOnPage || 0
    }));

    // Вычисляем конверсию
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return NextResponse.json({
      venue: {
        id: venue.id,
        name: venue.name,
        tariff: venue.tariff
      },
      period: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        days: Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalViews,
        totalClicks,
        totalConversions,
        avgTimeOnPage: Math.round(avgTimeOnPage),
        conversionRate: Math.round(conversionRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100
      },
      trafficSources: Object.entries(trafficSources).map(([source, data]) => ({
        source,
        views: data.views,
        clicks: data.clicks,
        conversions: data.conversions,
        percentage: totalViews > 0 ? Math.round((data.views / totalViews) * 100) : 0
      })),
      chartData
    });

  } catch (error) {
    console.error('GET /api/vendor/venues/[id]/analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: добавить событие аналитики
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id);
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      eventType, // 'view', 'click', 'conversion'
      referrer, 
      timeOnPage,
      userAgent,
      ipAddress 
    } = body;

    if (!eventType || !['view', 'click', 'conversion'].includes(eventType)) {
      return NextResponse.json({ 
        error: 'Invalid event type' 
      }, { status: 400 });
    }

    // Получаем или создаем запись аналитики за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await prisma.venueAnalytics.findFirst({
      where: {
        venueId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!analytics) {
      analytics = await prisma.venueAnalytics.create({
        data: {
          venueId,
          date: today,
          views: 0,
          clicks: 0,
          conversions: 0,
          referrer,
          timeOnPage: timeOnPage || null,
          userAgent,
          ipAddress
        }
      });
    }

    // Обновляем счетчики
    const updateData: any = {};
    
    switch (eventType) {
      case 'view':
        updateData.views = { increment: 1 };
        break;
      case 'click':
        updateData.clicks = { increment: 1 };
        break;
      case 'conversion':
        updateData.conversions = { increment: 1 };
        break;
    }

    if (timeOnPage && timeOnPage > (analytics.timeOnPage || 0)) {
      updateData.timeOnPage = timeOnPage;
    }

    const updatedAnalytics = await prisma.venueAnalytics.update({
      where: { id: analytics.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      analytics: updatedAnalytics
    });

  } catch (error) {
    console.error('POST /api/vendor/venues/[id]/analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
