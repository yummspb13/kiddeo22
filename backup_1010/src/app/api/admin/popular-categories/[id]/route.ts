import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить конкретную популярную категорию
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

    const category = await prisma.popularCategory.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Popular category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching popular category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular category' },
      { status: 500 }
    );
  }
}

// PUT - обновить популярную категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color, cityId, sortOrder, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (cityId !== undefined) updateData.cityId = cityId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.popularCategory.update({
      where: { id: parseInt((await params).id) },
      data: updateData,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating popular category:', error);
    return NextResponse.json(
      { error: 'Failed to update popular category' },
      { status: 500 }
    );
  }
}

// DELETE - удалить популярную категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.popularCategory.delete({
      where: { id: parseInt((await params).id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting popular category:', error);
    return NextResponse.json(
      { error: 'Failed to delete popular category' },
      { status: 500 }
    );
  }
}
