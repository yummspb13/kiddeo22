import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const citySlug = searchParams.get('citySlug');

    const where: any = { status };
    
    if (citySlug) {
      const city = await prisma.city.findUnique({
        where: { slug: citySlug }
      });
      if (city) {
        where.cityId = city.id;
      }
    }

    const suggestions = await prisma.venueSuggestion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error('Error fetching venue suggestions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch venue suggestions' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, moderatorNote } = body;

    // Получаем предложение с информацией о пользователе
    const suggestion = await prisma.venueSuggestion.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // Обновляем статус предложения
    const updatedSuggestion = await prisma.venueSuggestion.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // Если место одобрено, добавляем баллы и уведомление
    if (status === 'APPROVED') {
          // Выполняем операции параллельно
          await Promise.all([
            // Добавляем 30 баллов за одобренное место через PointsTransaction
            prisma.pointsTransaction.create({
              data: {
                userId: suggestion.userId,
                points: 30,
                type: 'EARNED',
                category: 'VENUE_SUGGESTION_APPROVED',
                description: `Место "${suggestion.name}" одобрено и добавлено в каталог`,
                venueId: suggestion.id
              }
            }),
            // Создаем уведомление
            prisma.userNotification.create({
              data: {
                userId: suggestion.userId,
                type: 'VENUE_APPROVED',
                title: '🎉 Ваше место одобрено!',
                message: `Место "${suggestion.name}" было одобрено и добавлено в каталог. Вы получили 30 баллов!`,
                data: {
                  suggestionId: suggestion.id,
                  venueName: suggestion.name,
                  pointsAwarded: 30
                }
              }
            })
          ]);
    } else if (status === 'REJECTED') {
      // Создаем уведомление об отклонении
      await prisma.userNotification.create({
        data: {
          userId: suggestion.userId,
          type: 'VENUE_REJECTED',
          title: '❌ Предложение отклонено',
          message: `К сожалению, место "${suggestion.name}" не подходит для нашего каталога.`,
          data: {
            suggestionId: suggestion.id,
            venueName: suggestion.name
          }
        }
      });
    }

    return NextResponse.json(updatedSuggestion);

  } catch (error) {
    console.error('Error updating venue suggestion:', error);
    return NextResponse.json({ 
      error: 'Failed to update venue suggestion' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.venueSuggestion.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting venue suggestion:', error);
    return NextResponse.json({ 
      error: 'Failed to delete venue suggestion' 
    }, { status: 500 });
  }
}
