import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

const CONTENT_TYPES = ['EVENT', 'VENUE', 'SERVICE', 'BLOG_POST', 'CATEGORY'] as const
type ContentType = typeof CONTENT_TYPES[number]

// GET - поиск событий/мест/услуг для добавления в рекламу
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType') as ContentType
    const citySlug = searchParams.get('citySlug') || 'moscow'
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    
    console.log('🔍 Search API called with:', { contentType, citySlug, query, limit })
    
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: searchParams.get('key') }) })

    if (!contentType || !CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Valid contentType is required' },
        { status: 400 }
      )
    }

    let results: any[] = []

    switch (contentType) {
      case 'EVENT':
        results = await searchEvents(citySlug, query, limit)
        break
      case 'VENUE':
        results = await searchVenues(citySlug, query, limit)
        break
      case 'SERVICE':
        results = await searchServices(citySlug, query, limit)
        break
      case 'BLOG_POST':
        results = await searchBlogPosts(citySlug, query, limit)
        break
      case 'CATEGORY':
        results = await searchCategories(citySlug, query, limit)
        break
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching content:', error)
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    )
  }
}

async function searchEvents(citySlug: string, query: string, limit: number) {
  // Получаем город по slug
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: { name: true }
  })
  
  const cityName = city?.name || 'Москва'
  
  const where: any = {
    city: cityName,
    status: 'active'
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { organizer: { contains: query, mode: 'insensitive' } }
    ]
  }

  const events = await prisma.afishaEvent.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      city: true,
      citySlug: true
    },
    orderBy: [
      { isPopular: 'desc' },
      { viewCount: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })

  return events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    image: event.coverImage,
    date: event.startDate,
    location: event.venue,
    organizer: event.organizer,
    price: event.minPrice,
    city: event.city,
    type: 'EVENT'
  }))
}

async function searchVenues(citySlug: string, query: string, limit: number) {
  const where: any = {
    city: { slug: citySlug },
    status: 'ACTIVE'
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } }
    ]
  }

  const venues = await prisma.venuePartner.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      coverImage: true,
      address: true,
      district: true,
      metro: true,
      priceFrom: true,
      priceTo: true,
      city: {
        select: { name: true }
      }
    },
    orderBy: [
      { tariff: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })

  return venues.map(venue => ({
    id: venue.id.toString(),
    title: venue.name,
    description: venue.description,
    image: venue.coverImage,
    location: venue.address,
    district: venue.district,
    metro: venue.metro,
    price: venue.priceFrom,
    city: venue.city.name,
    type: 'VENUE'
  }))
}

async function searchServices(citySlug: string, query: string, limit: number) {
  const where: any = {
    city: { slug: citySlug },
    isActive: true
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ]
  }

  const services = await prisma.listing.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      priceFrom: true,
      priceTo: true,
      address: true,
      city: {
        select: { name: true }
      },
      category: {
        select: { name: true }
      }
    },
    orderBy: [
      { createdAt: 'desc' }
    ],
    take: limit
  })

  return services.map(service => ({
    id: service.id.toString(),
    title: service.title,
    description: service.description,
    image: service.images ? JSON.parse(service.images)[0] : null,
    price: service.priceFrom,
    location: service.address,
    category: service.category.name,
    city: service.city.name,
    type: 'SERVICE'
  }))
}

async function searchBlogPosts(citySlug: string, query: string, limit: number) {
  const where: any = {
    status: 'PUBLISHED',
    type: 'blog'
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } }
    ]
  }

  const blogPosts = await prisma.content.findMany({
    where,
    select: {
      id: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      viewCount: true,
      likeCount: true
    },
    orderBy: [
      { publishedAt: 'desc' }
    ],
    take: limit
  })

  return blogPosts.map(post => ({
    id: post.id.toString(),
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    date: post.publishedAt,
    views: post.viewCount,
    likes: post.likeCount,
    type: 'BLOG_POST'
  }))
}

async function searchCategories(citySlug: string, query: string, limit: number) {
  const where: any = {
    isActive: true,
    citySubcategories: {
      some: {
        city: {
          slug: citySlug
        }
      }
    }
  }

  if (query) {
    where.name = { contains: query, mode: 'insensitive' }
  }

  const categories = await prisma.venueSubcategory.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      _count: {
        select: {
          partners: {
            where: {
              status: 'ACTIVE',
              city: {
                slug: citySlug
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' },
    take: limit
  })

  return categories.map(category => ({
    id: category.id.toString(),
    title: category.name,
    description: null,
    slug: category.slug,
    icon: category.icon,
    color: category.color,
    count: category._count.partners,
    type: 'CATEGORY'
  }))
}
