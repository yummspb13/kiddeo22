import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Проверяем, что это внутренний вызов (можно добавить секретный ключ)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'cron-secret-key';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      processed: 0,
      renewed: 0,
      gracePeriodStarted: 0,
      downgraded: 0,
      errors: []
    };

    console.log('🔄 Starting venue tariff check...');

    // 1. Проверяем места с истекшими тарифами
    const expiredVenues = await prisma.venuePartner.findMany({
      where: {
        tariff: { in: ['SUPER', 'MAXIMUM'] },
        tariffExpiresAt: {
          lt: now
        },
        tariffGracePeriodEndsAt: null // Еще не в grace period
      },
      include: {
        vendor: {
          include: {
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

    console.log(`📊 Found ${expiredVenues.length} venues with expired tariffs`);

    for (const venue of expiredVenues) {
      try {
        if (venue.tariffAutoRenew) {
          // Автопродление - продлеваем на месяц
          const newExpiryDate = new Date();
          newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

          await prisma.$transaction(async (tx) => {
            // Завершаем текущий период в истории
            await tx.venueTariffHistory.updateMany({
              where: {
                venueId: venue.id,
                endedAt: null
              },
              data: {
                endedAt: now
              }
            });

            // Создаем новую запись в истории
            await tx.venueTariffHistory.create({
              data: {
                venueId: venue.id,
                tariff: venue.tariff,
                startedAt: now,
                price: venue.tariffPrice,
                autoRenewed: true
              }
            });

            // Обновляем дату истечения
            await tx.venuePartner.update({
              where: { id: venue.id },
              data: {
                tariffExpiresAt: newExpiryDate
              }
            });
          });

          results.renewed++;
          console.log(`✅ Auto-renewed tariff for venue ${venue.id} (${venue.name})`);
        } else {
          // Нет автопродления - начинаем grace period (3 дня)
          const gracePeriodEnds = new Date();
          gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 3);

          await prisma.venuePartner.update({
            where: { id: venue.id },
            data: {
              tariffGracePeriodEndsAt: gracePeriodEnds
            }
          });

          results.gracePeriodStarted++;
          console.log(`⏰ Started grace period for venue ${venue.id} (${venue.name})`);
        }

        results.processed++;
      } catch (error) {
        console.error(`❌ Error processing venue ${venue.id}:`, error);
        results.errors.push({
          venueId: venue.id,
          venueName: venue.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 2. Проверяем места с истекшим grace period
    const gracePeriodExpiredVenues = await prisma.venuePartner.findMany({
      where: {
        tariff: { in: ['SUPER', 'MAXIMUM'] },
        tariffGracePeriodEndsAt: {
          lt: now
        }
      },
      include: {
        vendor: {
          include: {
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

    console.log(`📊 Found ${gracePeriodExpiredVenues.length} venues with expired grace period`);

    for (const venue of gracePeriodExpiredVenues) {
      try {
        await prisma.$transaction(async (tx) => {
          // Завершаем текущий тариф в истории
          await tx.venueTariffHistory.updateMany({
            where: {
              venueId: venue.id,
              endedAt: null
            },
            data: {
              endedAt: now
            }
          });

          // Создаем новую запись для FREE тарифа
          await tx.venueTariffHistory.create({
            data: {
              venueId: venue.id,
              tariff: 'FREE',
              startedAt: now,
              price: null,
              autoRenewed: false
            }
          });

          // Понижаем тариф до FREE
          await tx.venuePartner.update({
            where: { id: venue.id },
            data: {
              tariff: 'FREE',
              tariffExpiresAt: null,
              tariffAutoRenew: false,
              tariffPrice: null,
              tariffGracePeriodEndsAt: null
            }
          });
        });

        results.downgraded++;
        console.log(`⬇️ Downgraded venue ${venue.id} (${venue.name}) to FREE tariff`);
        results.processed++;
      } catch (error) {
        console.error(`❌ Error downgrading venue ${venue.id}:`, error);
        results.errors.push({
          venueId: venue.id,
          venueName: venue.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 3. Сбрасываем счетчики новостей в начале месяца
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const venuesToResetNews = await prisma.venuePartner.findMany({
      where: {
        tariff: { in: ['SUPER', 'MAXIMUM'] },
        OR: [
          { newsResetAt: null },
          { newsResetAt: { lt: firstDayOfMonth } }
        ]
      }
    });

    for (const venue of venuesToResetNews) {
      try {
        await prisma.venuePartner.update({
          where: { id: venue.id },
          data: {
            newsCountThisMonth: 0,
            newsResetAt: firstDayOfMonth
          }
        });
        console.log(`📰 Reset news counter for venue ${venue.id} (${venue.name})`);
      } catch (error) {
        console.error(`❌ Error resetting news counter for venue ${venue.id}:`, error);
        results.errors.push({
          venueId: venue.id,
          venueName: venue.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('✅ Venue tariff check completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Venue tariff check completed',
      results,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
