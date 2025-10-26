const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVenue() {
  try {
    const venue = await prisma.venuePartner.findFirst({
      where: { id: 1 },
      include: {
        vendor: true,
        subcategory: {
          include: {
            category: true
          }
        },
        city: true
      }
    })
    
    if (!venue) {
      console.log('Venue with ID 1 not found')
      
      // Найдем первый venue
      const firstVenue = await prisma.venuePartner.findFirst({
        include: {
          vendor: true,
          subcategory: {
            include: {
              category: true
            }
          },
          city: true
        }
      })
      
      if (firstVenue) {
        console.log('First venue found:')
        console.log('ID:', firstVenue.id)
        console.log('Name:', firstVenue.name)
        console.log('Vendor ID:', firstVenue.vendorId)
        console.log('City:', firstVenue.city?.name)
        console.log('Subcategory:', firstVenue.subcategory?.name)
      } else {
        console.log('No venues found in database')
      }
      return
    }
    
    console.log('Venue found:')
    console.log('ID:', venue.id)
    console.log('Name:', venue.name)
    console.log('Description:', venue.description)
    console.log('Address:', venue.address)
    console.log('Vendor ID:', venue.vendorId)
    console.log('City:', venue.city?.name)
    console.log('Subcategory:', venue.subcategory?.name)
    console.log('Category:', venue.subcategory?.category?.name)
    console.log('Additional Images:', venue.additionalImages)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVenue()
