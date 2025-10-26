import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const table = searchParams.get('table') || 'AfishaEvent'
    const excludeId = searchParams.get('excludeId')
    
    if (!slug) {
      return NextResponse.json({ exists: false })
    }
    
    // Универсальная проверка slug в разных таблицах
    let exists = false
    
    switch (table) {
      case 'AfishaEvent':
        const event = await prisma.afishaEvent.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          } as any,
          select: { id: true }
        })
        exists = !!event
        break
        
      case 'City':
        const city = await prisma.city.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!city
        break
        
      case 'Category':
        const category = await prisma.category.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!category
        break
        
      case 'Listing':
        const listing = await prisma.listing.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!listing
        break
        
      case 'Content':
        const content = await prisma.content.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!content
        break
        
      case 'VenuePartner':
        const venuePartner = await prisma.venuePartner.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!venuePartner
        break
        
      case 'VenueCategory':
        const venueCategory = await prisma.venueCategory.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!venueCategory
        break
        
      case 'VenueSubcategory':
        const venueSubcategory = await prisma.venueSubcategory.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!venueSubcategory
        break
        
      case 'Interest':
        const interest = await prisma.interest.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!interest
        break
        
      case 'ContentCategory':
        const contentCategory = await prisma.contentCategory.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!contentCategory
        break
        
      case 'PopularEvent':
        const popularEvent = await prisma.popularEvent.findFirst({
          where: { 
            slug,
            ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
          },
          select: { id: true }
        })
        exists = !!popularEvent
        break
        
      default:
        return NextResponse.json({ exists: false })
    }
    
    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json({ exists: false })
  }
}
