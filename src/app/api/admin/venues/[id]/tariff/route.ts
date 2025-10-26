import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromToken } from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: получить текущий тариф и историю
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
    if (!session.isAuthenticated || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем информацию о месте и тарифе
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        tariff: true,
        tariffExpiresAt: true,
        tariffAutoRenew: true,
        tariffGracePeriodEndsAt: true,
        tariffPrice: true,
        createdAt: true,
        vendor: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Получаем историю тарифов
    const tariffHistory = await prisma.venueTariffHistory.findMany({
      where: { venueId },
      orderBy: { startedAt: 'desc' },
      include: {
        cancelledByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      venue,
      tariffHistory
    });

  } catch (error) {
    console.error('GET /api/admin/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: изменить тариф (только админ)
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
    if (!session.isAuthenticated || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      tariff, 
      expiresAt, 
      autoRenew = false, 
      price,
      reason 
    } = body;

    if (!tariff || !['FREE', 'SUPER', 'MAXIMUM'].includes(tariff)) {
      return NextResponse.json({ error: 'Invalid tariff' }, { status: 400 });
    }

    // Проверяем, что место существует
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, tariff: true }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Начинаем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // Завершаем текущий тариф в истории
      if (venue.tariff !== tariff) {
        await tx.venueTariffHistory.updateMany({
          where: {
            venueId,
            endedAt: null
          },
          data: {
            endedAt: new Date()
          }
        });

        // Создаем новую запись в истории
        await tx.venueTariffHistory.create({
          data: {
            venueId,
            tariff: tariff as any,
            startedAt: new Date(),
            price: price || null,
            autoRenewed: false,
            cancelledBy: session.user?.id ? parseInt(session.user.id) : null
          }
        });
      }

      // Обновляем тариф места
      const updatedVenue = await tx.venuePartner.update({
        where: { id: venueId },
        data: {
          tariff: tariff as any,
          tariffExpiresAt: expiresAt ? new Date(expiresAt) : null,
          tariffAutoRenew: autoRenew,
          tariffPrice: price || null,
          tariffGracePeriodEndsAt: null // Сбрасываем grace period при смене тарифа
        }
      });

      return updatedVenue;
    });

    return NextResponse.json({
      success: true,
      venue: result,
      message: `Tariff changed to ${tariff}`
    });

  } catch (error) {
    console.error('POST /api/admin/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH: обновить автопродление, таймер
export async function PATCH(
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
    if (!session.isAuthenticated || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { expiresAt, autoRenew, price } = body;

    const updateData: any = {};
    
    if (expiresAt !== undefined) {
      updateData.tariffExpiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    
    if (autoRenew !== undefined) {
      updateData.tariffAutoRenew = autoRenew;
    }
    
    if (price !== undefined) {
      updateData.tariffPrice = price;
    }

    const updatedVenue = await prisma.venuePartner.update({
      where: { id: venueId },
      data: updateData,
      select: {
        id: true,
        name: true,
        tariff: true,
        tariffExpiresAt: true,
        tariffAutoRenew: true,
        tariffPrice: true
      }
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue
    });

  } catch (error) {
    console.error('PATCH /api/admin/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: отменить/остановить тариф
export async function DELETE(
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
    if (!session.isAuthenticated || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Начинаем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // Завершаем текущий тариф в истории
      await tx.venueTariffHistory.updateMany({
        where: {
          venueId,
          endedAt: null
        },
        data: {
          endedAt: new Date(),
          cancelledBy: session.user?.id ? parseInt(session.user.id) : null
        }
      });

      // Сбрасываем тариф до FREE
      const updatedVenue = await tx.venuePartner.update({
        where: { id: venueId },
        data: {
          tariff: 'FREE',
          tariffExpiresAt: null,
          tariffAutoRenew: false,
          tariffPrice: null,
          tariffGracePeriodEndsAt: null
        }
      });

      return updatedVenue;
    });

    return NextResponse.json({
      success: true,
      venue: result,
      message: 'Tariff cancelled and reset to FREE'
    });

  } catch (error) {
    console.error('DELETE /api/admin/venues/[id]/tariff error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
