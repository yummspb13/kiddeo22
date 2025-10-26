import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 SUBCATEGORIES API: GET request started');
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const adminKey = searchParams.get('key');

    console.log('🔍 SUBCATEGORIES API: Admin key check:', adminKey);

    if (adminKey !== 'kidsreview2025') {
      console.log('🔍 SUBCATEGORIES API: Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Если categoryId не указан, возвращаем все подкатегории
    const whereClause = categoryId 
      ? { categoryId: parseInt(categoryId), isActive: true }
      : { isActive: true };

    console.log('🔍 SUBCATEGORIES API: Fetching subcategories with where clause:', whereClause);

    const subcategories = await prisma.venueSubcategory.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        citySubcategories: {
          include: {
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            filters: true,
            partners: true
          }
        }
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('🔍 SUBCATEGORIES API: Found subcategories:', subcategories.length);
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('🔍 SUBCATEGORIES API: Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 SUBCATEGORIES API: POST request started');
    
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    console.log('🔍 SUBCATEGORIES API: Admin key check:', adminKey);

    if (adminKey !== 'kidsreview2025') {
      console.log('🔍 SUBCATEGORIES API: Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 SUBCATEGORIES API: Request body:', body);

    const { name, slug, categoryId, icon, color, backgroundImage, cityIds } = body;

    if (!name || !slug || !categoryId) {
      console.log('🔍 SUBCATEGORIES API: Missing required fields:', { name, slug, categoryId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔍 SUBCATEGORIES API: Creating subcategory with data:', {
      name,
      slug,
      categoryId: parseInt(categoryId),
      icon,
      color,
      backgroundImage,
      cityIds
    });

    // Проверяем, существует ли уже подкатегория с таким именем
    const existingSubcategory = await prisma.venueSubcategory.findFirst({
      where: {
        OR: [
          { name: name },
          { slug: slug }
        ]
      }
    });

    if (existingSubcategory) {
      console.log('🔍 SUBCATEGORIES API: Subcategory already exists:', existingSubcategory.name);
      return NextResponse.json({ 
        error: 'Подкатегория с таким названием или slug уже существует',
        existingSubcategory 
      }, { status: 409 });
    }

    const subcategory = await prisma.venueSubcategory.create({
      data: {
        name,
        slug,
        categoryId: parseInt(categoryId),
        icon,
        color,
        backgroundImage,
        citySubcategories: cityIds && cityIds.length > 0 ? {
          create: cityIds.map((cityId: number) => ({
            cityId: cityId
          }))
        } : undefined
      }
    });

    console.log('🔍 SUBCATEGORIES API: Subcategory created successfully:', subcategory.id);
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('🔍 SUBCATEGORIES API: Error creating subcategory:', error);
    return NextResponse.json({ error: 'Failed to create subcategory', details: error.message }, { status: 500 });
  }
}