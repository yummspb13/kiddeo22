import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить популярные категории для события
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    // Получаем событие с его популярными категориями
    const event = await prisma.afishaEvent.findUnique({
      where: { id: eventId },
      include: {
        popularCategories: {
          include: {
            popularCategory: {
              include: {
                city: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event.popularCategories);
  } catch (error) {
    console.error('Error fetching event popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event popular categories' },
      { status: 500 }
    );
  }
}

// POST - добавить событие к популярной категории
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { 
      popularCategoryId, 
      isPermanent = false, 
      daysToShow, 
      startDate, 
      endDate 
    } = body;

    if (!popularCategoryId) {
      return NextResponse.json(
        { error: 'popularCategoryId is required' },
        { status: 400 }
      );
    }

    // Проверяем, что событие существует
    const event = await prisma.afishaEvent.findUnique({
      where: { id: eventId.toString() }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Проверяем, что популярная категория существует
    const popularCategory = await prisma.popularCategory.findUnique({
      where: { id: popularCategoryId }
    });

    if (!popularCategory) {
      return NextResponse.json(
        { error: 'Popular category not found' },
        { status: 404 }
      );
    }

    // Вычисляем даты, если указано количество дней
    let calculatedStartDate = startDate ? new Date(startDate) : new Date();
    let calculatedEndDate = endDate ? new Date(endDate) : null;

    if (!isPermanent && daysToShow && !endDate) {
      calculatedEndDate = new Date(calculatedStartDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + daysToShow);
    }

    const eventPopularCategory = await prisma.afishaEventPopularCategory.create({
      data: {
        afishaEventId: eventId.toString(),
        popularCategoryId,
        isPermanent,
        daysToShow: isPermanent ? null : daysToShow,
        startDate: isPermanent ? null : calculatedStartDate,
        endDate: isPermanent ? null : calculatedEndDate
      },
      include: {
        popularCategory: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(eventPopularCategory, { status: 201 });
  } catch (error) {
    console.error('Error adding event to popular category:', error);
    return NextResponse.json(
      { error: 'Failed to add event to popular category' },
      { status: 500 }
    );
  }
}
