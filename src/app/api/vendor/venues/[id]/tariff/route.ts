import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromToken } from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: получить информацию о тарифе (для вендора)
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

    // Получаем информацию о месте и проверяем владельца
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
        tariffAutoRenew: true,
        tariffGracePeriodEndsAt: true,
        tariffPrice: true,
        newsCountThisMonth: true,
        newsResetAt: true,
        createdAt: true
      }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 });
    }

    // Получаем историю тарифов (только для этого вендора)
    const tariffHistory = await prisma.venueTariffHistory.findMany({
      where: { venueId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        tariff: true,
        startedAt: true,
        endedAt: true,
        price: true,
        autoRenewed: true
      }
    });

    // Вычисляем статус тарифа
    const now = new Date();
    let tariffStatus = 'active';
    let daysUntilExpiry = null;
    let gracePeriodDays = null;

    if (venue.tariff === 'FREE') {
      tariffStatus = 'free';
    } else if (venue.tariffExpiresAt) {
      const expiryDate = new Date(venue.tariffExpiresAt);
      const daysDiff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        tariffStatus = 'active';
        daysUntilExpiry = daysDiff;
      } else if (venue.tariffGracePeriodEndsAt) {
        const graceEndDate = new Date(venue.tariffGracePeriodEndsAt);
        const graceDaysDiff = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (graceDaysDiff > 0) {
          tariffStatus = 'grace_period';
          gracePeriodDays = graceDaysDiff;
        } else {
          tariffStatus = 'expired';
        }
      } else {
        tariffStatus = 'expired';
      }
    }

    // Получаем лимиты для текущего тарифа
    const limits = {
      photos: venue.tariff === 'FREE' ? 4 : venue.tariff === 'SUPER' ? 10 : 15,
      newsPerMonth: venue.tariff === 'FREE' ? 0 : venue.tariff === 'SUPER' ? 3 : 5,
      hasRichDescription: venue.tariff !== 'FREE',
      hasFeatures: venue.tariff !== 'FREE',
      hasAnalytics: venue.tariff !== 'FREE',
      hasPriceFields: venue.tariff !== 'FREE'
    };

    return NextResponse.json({
      venue,
      tariffHistory,
      tariffStatus,
      daysUntilExpiry,
      gracePeriodDays,
      limits
    });

  } catch (error) {
    console.error('GET /api/vendor/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: запрос на обновление тарифа (создание платежа)
export async function POST(
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

    const body = await request.json();
    const { tariff, duration = 30 } = body; // duration в днях

    if (!tariff || !['SUPER', 'MAXIMUM'].includes(tariff)) {
      return NextResponse.json({ error: 'Invalid tariff' }, { status: 400 });
    }

    // Проверяем, что место принадлежит вендору
    const venue = await prisma.venuePartner.findFirst({
      where: { 
        id: venueId,
        vendor: {
          userId: parseInt(session.user!.id)
        }
      },
      select: { id: true, name: true, tariff: true }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 });
    }

    // Определяем цену тарифа
    const tariffPrices = {
      SUPER: 690, // 690 рублей в месяц
      MAXIMUM: 1290 // 1290 рублей в месяц (пока не используется)
    };

    const price = tariffPrices[tariff as keyof typeof tariffPrices];
    const totalAmount = Math.round((price * duration) / 30); // Пропорционально количеству дней

    // Создаем запрос на оплату (пока просто возвращаем информацию)
    // В реальном проекте здесь будет интеграция с платежной системой
    const paymentRequest = {
      venueId,
      tariff,
      duration,
      price,
      totalAmount,
      currency: 'RUB',
      description: `Тариф ${tariff} для места "${venue.name}" на ${duration} дней`,
      // В реальном проекте здесь будет URL для оплаты
      paymentUrl: null // `https://payment.example.com/pay/${paymentId}`
    };

    return NextResponse.json({
      success: true,
      paymentRequest,
      message: 'Payment request created. Integration with payment system needed.'
    });

  } catch (error) {
    console.error('POST /api/vendor/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
