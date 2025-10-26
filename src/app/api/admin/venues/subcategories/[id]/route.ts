import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug, icon, color, backgroundImage, cityIds } = await request.json();

    // Сначала удаляем все существующие связи с городами
    await prisma.venueSubcategoryCity.deleteMany({
      where: { subcategoryId: parseInt(id) }
    });

    const subcategory = await prisma.venueSubcategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
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

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.venueSubcategory.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}