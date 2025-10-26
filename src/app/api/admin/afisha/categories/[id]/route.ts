import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs'

// GET - получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Проверка админ-ключа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const category = await prisma.afishaCategory.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching afisha category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Проверка админ-ключа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    const body = await request.json();
    console.log('PUT /api/admin/afisha/categories/[id] - Body:', body);
    
    const { name, slug, description, icon, coverImage, color, sortOrder, isActive } = body;

    // Валидация
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Проверка уникальности slug (исключая текущую категорию)
    const existingCategory = await prisma.afishaCategory.findFirst({
      where: {
        slug,
        id: { not: parseInt(resolvedParams.id) }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.afishaCategory.update({
      where: { id: parseInt(resolvedParams.id) },
      data: {
        name,
        slug,
        description,
        icon,
        coverImage,
        color,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating afisha category:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Проверка админ-ключа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Проверяем, есть ли события с этой категорией
    const eventsCount = await prisma.afishaEvent.count({
      where: { categoryId: parseInt(resolvedParams.id) }
    });

    if (eventsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. ${eventsCount} events are using this category.` },
        { status: 400 }
      );
    }

    await prisma.afishaCategory.delete({
      where: { id: parseInt(resolvedParams.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting afisha category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
