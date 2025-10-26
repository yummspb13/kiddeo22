const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVenues() {
  try {
    console.log('🔍 Testing Prisma venues...')
    
    // Проверяем города
    const cities = await prisma.city.findMany({
      select: { id: true, name: true, slug: true }
    })
    console.log('Cities:', cities)
    
    // Проверяем места
    const venues = await prisma.venuePartner.findMany({
      where: { status: 'ACTIVE' },
      select: { 
        id: true, 
        name: true, 
        slug: true,
        city: {
          select: { name: true, slug: true }
        }
      },
      take: 5
    })
    console.log('Venues:', venues)
    
    // Проверяем места в Москве
    const moscowVenues = await prisma.venuePartner.findMany({
      where: { 
        status: 'ACTIVE',
        city: { slug: 'moskva' }
      },
      select: { 
        id: true, 
        name: true, 
        slug: true
      },
      take: 5
    })
    console.log('Moscow venues:', moscowVenues)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testVenues()

