import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 VENUE-SUGGESTIONS: Starting POST request');
    
    const session = await getServerSession(request);
    console.log('🔍 VENUE-SUGGESTIONS: Session:', session ? 'found' : 'not found');
    
    if (!session?.user?.id) {
      console.log('🔍 VENUE-SUGGESTIONS: No user ID, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 VENUE-SUGGESTIONS: Request body:', body);
    const { name, address, description, category, contact, citySlug } = body;

    // Валидация обязательных полей
    if (!name || !address || !description || !category || !citySlug) {
      console.log('🔍 VENUE-SUGGESTIONS: Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Находим город
    console.log('🔍 VENUE-SUGGESTIONS: Looking for city with slug:', citySlug);
    const city = await prisma.city.findUnique({
      where: { slug: citySlug }
    });
    console.log('🔍 VENUE-SUGGESTIONS: City found:', city ? 'yes' : 'no');

    if (!city) {
      console.log('🔍 VENUE-SUGGESTIONS: City not found, returning 404');
      return NextResponse.json({ 
        error: 'City not found' 
      }, { status: 404 });
    }

    // Создаем предложение места
    const suggestion = await prisma.venueSuggestion.create({
      data: {
        name,
        address,
        description,
        category,
        contact: contact || null,
        cityId: city.id,
        userId: parseInt(session.user.id),
        status: 'PENDING'
      }
    });

    // Создаем уведомление о подаче заявки (без начисления баллов)
    await prisma.userNotification.create({
      data: {
        userId: parseInt(session.user.id),
        type: 'VENUE_SUBMITTED',
        title: '✅ Предложение отправлено!',
        message: `Ваше предложение места "${name}" отправлено на модерацию. После одобрения вы получите баллы!`,
        data: {
          suggestionId: suggestion.id,
          venueName: name,
          pointsAwarded: 0
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      suggestionId: suggestion.id,
      pointsAwarded: 0
    });

  } catch (error) {
    console.error('🔍 VENUE-SUGGESTIONS: Error creating venue suggestion:', error);
    console.error('🔍 VENUE-SUGGESTIONS: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to create venue suggestion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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
