import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs'

// GET - получить все категории афиши
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Проверка админ-ключа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.afishaCategory.findMany({
      orderBy: [
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching afisha categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - создать новую категорию афиши
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Проверка админ-ключа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, icon, coverImage, color, sortOrder } = body;

    // Валидация
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Проверка уникальности slug
    const existingCategory = await prisma.afishaCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.afishaCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        coverImage,
        color,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating afisha category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
