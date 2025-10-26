// Отладка страницы места
const { PrismaClient } = require('@prisma/client');

async function debugVenuePage() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Starting venue page debug...');
    
    // 1. Проверяем подключение к БД
    console.log('\n1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // 2. Проверяем город
    console.log('\n2. Checking city...');
    const city = await prisma.city.findUnique({
      where: { slug: 'moskva' },
      select: { id: true, name: true, slug: true, isPublic: true }
    });
    console.log('City found:', city);
    
    if (!city || !city.isPublic) {
      console.log('❌ City not found or not public');
      return;
    }
    
    // 3. Проверяем место
    console.log('\n3. Checking venue...');
    const venue = await prisma.venuePartner.findFirst({
      where: {
        slug: 'popugaynya',
        cityId: city.id,
        status: 'ACTIVE'
      },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        vendor: {
          select: {
            id: true,
            displayName: true,
            description: true,
            logo: true,
            website: true,
            phone: true,
            email: true,
            address: true
          }
        }
      }
    });
    
    console.log('Venue found:', venue ? 'Yes' : 'No');
    if (venue) {
      console.log('Venue name:', venue.name);
      console.log('Venue coordinates:', venue.lat, venue.lng);
    }
    
    // 4. Проверяем похожие места (это может быть проблемой)
    console.log('\n4. Checking similar venues...');
    const startTime = Date.now();
    
    const similarVenues = await prisma.venuePartner.findMany({
      where: {
        subcategoryId: venue.subcategoryId,
        cityId: city.id,
        status: 'ACTIVE',
        id: { not: venue.id }
      },
      include: {
        vendor: {
          select: {
            displayName: true,
            logo: true
          }
        },
        subcategory: {
          select: {
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    const duration = Date.now() - startTime;
    console.log(`Similar venues query took: ${duration}ms`);
    console.log('Similar venues found:', similarVenues.length);
    
    // 5. Проверяем отзывы (если есть)
    console.log('\n5. Checking reviews...');
    const reviews = await prisma.venueReview.findMany({
      where: {
        venueId: venue.id,
        status: 'APPROVED'
      },
      take: 5
    });
    console.log('Reviews found:', reviews.length);
    
    console.log('\n✅ Debug completed successfully');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVenuePage();
