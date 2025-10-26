import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT - обновить связь события с популярной категорией
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const categoryId = resolvedParams.categoryId;
    const body = await request.json();
    const { 
      isPermanent, 
      daysToShow, 
      startDate, 
      endDate 
    } = body;

    // Вычисляем даты, если указано количество дней
    let calculatedStartDate = startDate ? new Date(startDate) : new Date();
    let calculatedEndDate = endDate ? new Date(endDate) : null;

    if (!isPermanent && daysToShow && !endDate) {
      calculatedEndDate = new Date(calculatedStartDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + daysToShow);
    }

    const eventPopularCategory = await prisma.afishaEventPopularCategory.update({
      where: {
        afishaEventId_popularCategoryId: {
          afishaEventId: eventId,
          popularCategoryId: parseInt(categoryId)
        }
      },
      data: {
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

    return NextResponse.json(eventPopularCategory);
  } catch (error) {
    console.error('Error updating event popular category:', error);
    return NextResponse.json(
      { error: 'Failed to update event popular category' },
      { status: 500 }
    );
  }
}

// DELETE - удалить связь события с популярной категорией
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const categoryId = parseInt(resolvedParams.categoryId);

    await prisma.afishaEventPopularCategory.delete({
      where: {
        afishaEventId_popularCategoryId: {
          afishaEventId: eventId,
          popularCategoryId: categoryId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event popular category:', error);
    return NextResponse.json(
      { error: 'Failed to delete event popular category' },
      { status: 500 }
    );
  }
}
