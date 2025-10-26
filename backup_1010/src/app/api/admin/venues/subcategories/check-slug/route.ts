import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const existingSubcategory = await prisma.venueSubcategory.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });

    return NextResponse.json({ 
      exists: !!existingSubcategory,
      subcategory: existingSubcategory 
    });
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    return NextResponse.json({ error: 'Failed to check slug uniqueness' }, { status: 500 });
  }
}
