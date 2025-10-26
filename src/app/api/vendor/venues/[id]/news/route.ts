import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromToken } from '@/lib/auth-session';
import { getTariffLimits, canUseFeature, type VenueTariffData } from '@/lib/tariff-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: получить новости места
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

    // Получаем новости места
    const news = await prisma.venueNews.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ news });

  } catch (error) {
    console.error('GET /api/vendor/venues/[id]/news error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: создать новую новость
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
    const { title, content, imageUrl, isPublished = false } = body;

    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Title and content are required' 
      }, { status: 400 });
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

    // Проверяем тарифные ограничения
    const venueData: VenueTariffData = {
      tariff: venue.tariff as any,
      tariffExpiresAt: venue.tariffExpiresAt,
      tariffGracePeriodEndsAt: venue.tariffGracePeriodEndsAt,
      newsCountThisMonth: venue.newsCountThisMonth,
      newsResetAt: venue.newsResetAt
    };

    const limits = getTariffLimits(venueData.tariff);
    
    // Проверяем, может ли вендор создавать новости
    if (!canUseFeature(venueData, 'newsPerMonth')) {
      return NextResponse.json({ 
        error: 'News feature is not available for your current tariff',
        details: 'Upgrade to SUPER or MAXIMUM tariff to create news'
      }, { status: 403 });
    }

    // Проверяем лимит новостей в месяц
    if (venue.newsCountThisMonth >= limits.newsPerMonth) {
      return NextResponse.json({ 
        error: 'Monthly news limit reached',
        details: `You can create up to ${limits.newsPerMonth} news per month. Current count: ${venue.newsCountThisMonth}`
      }, { status: 403 });
    }

    // Создаем новость
    const news = await prisma.venueNews.create({
      data: {
        venueId,
        title,
        content,
        imageUrl: imageUrl || null,
        isPublished,
        authorId: parseInt(session.user!.id)
      }
    });

    // Обновляем счетчик новостей
    await prisma.venuePartner.update({
      where: { id: venueId },
      data: {
        newsCountThisMonth: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      news,
      message: 'News created successfully'
    });

  } catch (error) {
    console.error('POST /api/vendor/venues/[id]/news error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH: обновить новость
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
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { newsId, title, content, imageUrl, isPublished } = body;

    if (!newsId) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    // Проверяем, что новость принадлежит вендору
    const existingNews = await prisma.venueNews.findFirst({
      where: {
        id: newsId,
        venueId,
        venue: {
          vendor: {
            userId: parseInt(session.user!.id)
          }
        }
      }
    });

    if (!existingNews) {
      return NextResponse.json({ 
        error: 'News not found or access denied' 
      }, { status: 404 });
    }

    // Обновляем новость
    const updatedNews = await prisma.venueNews.update({
      where: { id: newsId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isPublished !== undefined && { isPublished })
      }
    });

    return NextResponse.json({
      success: true,
      news: updatedNews,
      message: 'News updated successfully'
    });

  } catch (error) {
    console.error('PATCH /api/vendor/venues/[id]/news error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: удалить новость
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
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('newsId');

    if (!newsId) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    // Проверяем, что новость принадлежит вендору
    const existingNews = await prisma.venueNews.findFirst({
      where: {
        id: newsId,
        venueId,
        venue: {
          vendor: {
            userId: parseInt(session.user!.id)
          }
        }
      }
    });

    if (!existingNews) {
      return NextResponse.json({ 
        error: 'News not found or access denied' 
      }, { status: 404 });
    }

    // Удаляем новость
    await prisma.venueNews.delete({
      where: { id: newsId }
    });

    // Уменьшаем счетчик новостей
    await prisma.venuePartner.update({
      where: { id: venueId },
      data: {
        newsCountThisMonth: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/vendor/venues/[id]/news error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}