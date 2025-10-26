import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getMinActivePrice } from '@/lib/price'

// Конфигурация для использования Node.js runtime
export const runtime = 'nodejs'

// GET - получить контент главной страницы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('citySlug') || 'moskva'

    // Получаем видимые блоки для города
    const blocks = await prisma.homePageBlock.findMany({
      where: { 
        citySlug,
        isVisible: true 
      },
      orderBy: { order: 'asc' }
    })

    const result: any = {}

    // Загружаем все блоки параллельно для ускорения
    const blockPromises = blocks.map(async (block) => {
      console.log(`Processing block: ${block.blockType}`)
      try {
        const content = await getBlockContent(block.blockType, citySlug)
        return {
          blockType: block.blockType,
          data: {
            ...block,
            content
          }
        }
      } catch (blockError) {
        console.error('Error processing block', block.blockType, ':', blockError)
        return {
          blockType: block.blockType,
          data: {
            ...block,
            content: []
          }
        }
      }
    })

    // Ждем завершения всех блоков
    const blockResults = await Promise.all(blockPromises)
    
    // Собираем результат
    blockResults.forEach(({ blockType, data }) => {
      result[blockType] = data
    })

    // Добавляем субкатегории мест напрямую
    try {
      const categories = await getCategories(citySlug, 8)
      result.CATEGORIES = {
        id: 'categories',
        blockType: 'CATEGORIES',
        citySlug,
        isVisible: true,
        order: 0,
        customTitle: 'Категории',
        customDescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: categories
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      result.CATEGORIES = {
        id: 'categories',
        blockType: 'CATEGORIES',
        citySlug,
        isVisible: true,
        order: 0,
        customTitle: 'Категории',
        customDescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: []
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage content' },
      { status: 500 }
    )
  }
}

async function getBlockContent(blockType: string, citySlug: string) {
  console.log(`getBlockContent called with blockType: ${blockType}, citySlug: ${citySlug}`)
  const now = new Date()
  
  // Получаем рекламный контент
  const ads = await prisma.homePageAd.findMany({
    where: {
      blockType,
      citySlug,
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now }
    },
    orderBy: { order: 'desc' }
  })

  const contentItems: any[] = []
  const maxItems = 8

  // Добавляем рекламный контент
  for (const ad of ads) {
    if (contentItems.length >= maxItems) break
    
    // Получаем данные из связанной таблицы
    if (ad.contentType === 'EVENT') {
      const contentData = await prisma.afishaEvent.findUnique({
        where: { id: ad.contentId }
      })
      if (contentData) {
        contentItems.push({
          id: contentData.id,
          title: contentData.title,
          description: contentData.description,
          image: contentData.coverImage,
          type: ad.contentType,
          isPaid: true
        })
      }
    } else if (ad.contentType === 'VENUE') {
      const contentData = await prisma.venuePartner.findUnique({
        where: { id: parseInt(ad.contentId) }
      })
      if (contentData) {
        contentItems.push({
          id: contentData.id.toString(),
          title: contentData.name,
          description: contentData.description,
          image: contentData.coverImage,
          type: ad.contentType,
          isPaid: true
        })
      }
    } else if (ad.contentType === 'SERVICE') {
      const contentData = await prisma.listing.findUnique({
        where: { id: parseInt(ad.contentId) }
      })
      if (contentData) {
        contentItems.push({
          id: contentData.id.toString(),
          title: contentData.title,
          description: contentData.description,
          image: contentData.images ? JSON.parse(contentData.images)[0] : null,
          type: ad.contentType,
          isPaid: true
        })
      }
    } else if (ad.contentType === 'CATEGORY') {
      const contentData = await prisma.venueSubcategory.findUnique({
        where: { id: parseInt(ad.contentId) }
      })
      if (contentData) {
        contentItems.push({
          id: contentData.id.toString(),
          title: contentData.name,
          description: null,
          slug: contentData.slug,
          icon: contentData.icon,
          color: contentData.color,
          type: ad.contentType,
          isPaid: true
        })
      }
    }
  }

  // Если не хватает контента, добавляем органический
  if (contentItems.length < maxItems) {
    console.log(`Adding organic content for blockType: ${blockType}, current items: ${contentItems.length}, maxItems: ${maxItems}`)
    const organicContent = await getOrganicContent(blockType, citySlug, maxItems - contentItems.length)
    console.log(`Organic content for ${blockType}:`, organicContent)
    contentItems.push(...organicContent)
  }
  
  console.log(`Final contentItems for ${blockType}:`, contentItems)

  return contentItems.slice(0, maxItems)
}

async function getOrganicContent(blockType: string, citySlug: string, limit: number) {
  switch (blockType) {
    case 'POPULAR_EVENTS':
      return getPopularEvents(citySlug, limit)
    case 'POPULAR_VENUES':
      return getPopularVenues(citySlug, limit)
    case 'POPULAR_SERVICES':
      return getPopularServices(citySlug, limit)
    case 'CATEGORIES':
      return getCategories(citySlug, limit)
    case 'COLLECTIONS':
      return getCollections(citySlug, limit)
    case 'RECOMMENDED':
      return getRecommended(citySlug, limit)
    case 'NEW_IN_CATALOG':
      return getNewInCatalog(citySlug, limit)
    case 'BLOG_POSTS':
      return getBlogPosts(citySlug, limit)
    default:
      return []
  }
}

async function getPopularEvents(citySlug: string, limit: number) {
  const events = await prisma.afishaEvent.findMany({
    where: {
      OR: [
        { citySlug },
        { citySlug: null, city: 'Москва' }
      ],
      status: 'active',
      startDate: { gte: new Date() }
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      tickets: true,
      isPaid: true,
      city: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: [
      { isPopular: 'desc' },
      { viewCount: 'desc' }
    ],
    take: limit
  })

  return events.map(event => {
    const computedMinPrice = getMinActivePrice(event.tickets, event.isPaid)
    const finalPrice = computedMinPrice !== null ? computedMinPrice : event.minPrice
    
    // Временный лог для отладки
    console.log('API EVENT:', { id: event.id, slug: event.slug, title: event.title })
    
    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      image: event.coverImage,
      date: event.startDate,
      location: event.venue,
      organizer: event.organizer,
      price: finalPrice,
      city: event.city,
      category: event.category?.name,
      type: 'EVENT',
      isPaid: false
    }
  })
}

async function getPopularVenues(citySlug: string, limit: number) {
  const venues = await prisma.venuePartner.findMany({
    where: {
      city: { slug: citySlug },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      coverImage: true,
      address: true,
      district: true,
      metro: true,
      priceFrom: true,
      city: { select: { name: true } },
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
      reviews: {
        where: {
          status: 'APPROVED'
        },
        select: {
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return venues.map(venue => {
    // Рассчитываем средний рейтинг
    const averageRating = venue.reviews.length > 0 
      ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length
      : 0

    return {
      id: venue.id.toString(),
      slug: venue.slug,
      title: venue.name,
      description: venue.description,
      image: venue.coverImage,
      location: venue.address,
      district: venue.district,
      metro: venue.metro,
      price: venue.priceFrom,
      city: venue.city.name,
      type: 'VENUE',
      isPaid: false,
      subcategory: venue.subcategory,
      averageRating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
      reviewsCount: venue.reviews.length
    }
  })
}

async function getPopularServices(citySlug: string, limit: number) {
  const services = await prisma.listing.findMany({
    where: {
      city: { slug: citySlug },
      isActive: true
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      images: true,
      priceFrom: true,
      address: true,
      city: { select: { name: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return services.map(service => ({
    id: service.id.toString(),
    slug: service.slug,
    title: service.title,
    description: service.description,
    image: service.images ? JSON.parse(service.images)[0] : null,
    price: service.priceFrom,
    location: service.address,
    category: service.category.name,
    city: service.city.name,
    type: 'SERVICE',
    isPaid: false
  }))
}

async function getBlogPosts(citySlug: string, limit: number) {
  const posts = await prisma.content.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'blog'
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      slug: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit
  })

  return posts.map(post => ({
    id: post.id.toString(),
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    slug: post.slug,
    author: null,
    publishedAt: post.publishedAt,
    type: 'BLOG_POST',
    isPaid: false
  }))
}

async function getCategories(citySlug: string, limit: number) {
  console.log('getCategories called with citySlug:', citySlug, 'limit:', limit)
  
  // Получаем закрепленные категории из HomePageAd
  const pinnedAds = await prisma.homePageAd.findMany({
    where: {
      blockType: 'CATEGORIES',
      citySlug,
      isActive: true,
      contentType: 'CATEGORY'
    },
    orderBy: { order: 'asc' }
  })
  
  console.log('pinnedAds:', pinnedAds)

  // Получаем все активные подкатегории мест для города
  const allSubcategories = await prisma.venueSubcategory.findMany({
    where: {
      isActive: true,
      citySubcategories: {
        some: {
          city: {
            slug: citySlug
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true
    },
    orderBy: { name: 'asc' }
  })
  
  console.log('allSubcategories:', allSubcategories)

  // Получаем детали закрепленных категорий
  const pinnedCategories: any[] = []
  for (const ad of pinnedAds) {
    const category = allSubcategories.find(cat => cat.id.toString() === ad.contentId)
    if (category) {
      pinnedCategories.push({
        id: category.id.toString(),
        title: category.name,
        description: null,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        type: 'CATEGORY',
        isPaid: false,
        isPinned: true,
        order: ad.order
      })
    }
  }

  // Получаем незакрепленные категории (исключаем уже закрепленные)
  const pinnedIds = pinnedAds.map(ad => ad.contentId)
  const unpinnedCategories = allSubcategories
    .filter(cat => !pinnedIds.includes(cat.id.toString()))
    .map(subcategory => ({
      id: subcategory.id.toString(),
      title: subcategory.name,
      description: null,
      slug: subcategory.slug,
      icon: subcategory.icon,
      color: subcategory.color,
      type: 'CATEGORY',
      isPaid: false,
      isPinned: false
    }))

  // Объединяем: закрепленные сверху + остальные
  const allCategories = [...pinnedCategories, ...unpinnedCategories]

  console.log('allCategories:', allCategories)

  return allCategories.slice(0, limit)
}

async function getCollections(citySlug: string, limit: number) {
  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
      citySlug: citySlug
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      _count: {
        select: {
          eventCollections: true,
          venueCollections: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return collections.map(collection => ({
    id: collection.id.toString(),
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    image: collection.coverImage,
    count: collection._count.eventCollections + collection._count.venueCollections,
    type: 'COLLECTION',
    isPaid: false
  }))
}

async function getRecommended(citySlug: string, limit: number) {
  console.log('getRecommended called with citySlug:', citySlug, 'limit:', limit);
  // Рекомендуемый контент - это популярные события и места
  const events = await prisma.afishaEvent.findMany({
    where: {
      status: 'active'
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      tickets: true,
      isPaid: true,
      city: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: [
      { isPopular: 'desc' },
      { viewCount: 'desc' }
    ],
    take: Math.ceil(limit / 2)
  })

  const venues = await prisma.venuePartner.findMany({
    where: {
      city: { slug: citySlug },
      status: 'ACTIVE',
      tariff: { not: 'FREE' }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      coverImage: true,
      address: true,
      district: true,
      metro: true,
      priceFrom: true,
      city: { select: { name: true } },
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
      reviews: {
        where: {
          status: 'APPROVED'
        },
        select: {
          rating: true
        }
      }
    },
    orderBy: { tariff: 'desc' },
    take: Math.floor(limit / 2)
  })

  const recommendedEvents = events.map(event => {
    const computedMinPrice = getMinActivePrice(event.tickets, event.isPaid)
    const finalPrice = computedMinPrice !== null ? computedMinPrice : event.minPrice

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      image: event.coverImage,
        date: event.startDate,
      location: event.venue,
      organizer: event.organizer,
      price: finalPrice,
      city: event.city,
      category: event.category?.name,
      type: 'EVENT',
      isPaid: false
    }
  })

  const recommendedVenues = venues.map(venue => {
    // Рассчитываем средний рейтинг
    const averageRating = venue.reviews.length > 0 
      ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length
      : 0

    return {
      id: venue.id.toString(),
      slug: venue.slug,
      title: venue.name,
      description: venue.description,
      image: venue.coverImage,
      location: venue.address,
      district: venue.district,
      metro: venue.metro,
      price: venue.priceFrom,
      city: venue.city.name,
      type: 'VENUE',
      isPaid: false,
      subcategory: venue.subcategory,
      averageRating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
      reviewsCount: venue.reviews.length
    }
  })

  const allRecommended = [...recommendedEvents, ...recommendedVenues]
  return allRecommended.slice(0, limit)
}

async function getNewInCatalog(citySlug: string, limit: number) {
  // Новые в каталоге - это недавно добавленные события, места и услуги
  const events = await prisma.afishaEvent.findMany({
    where: {
      OR: [
        { citySlug },
        { citySlug: null, city: 'Москва' }
      ],
      status: 'active',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // За последние 30 дней
      }
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      tickets: true,
      isPaid: true,
      city: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.ceil(limit / 3)
  })

  const venues = await prisma.venuePartner.findMany({
    where: {
      city: { slug: citySlug },
      status: 'ACTIVE',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      coverImage: true,
      address: true,
      district: true,
      metro: true,
      priceFrom: true,
      city: { select: { name: true } },
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
      reviews: {
        where: {
          status: 'APPROVED'
        },
        select: {
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.ceil(limit / 3)
  })

  const services = await prisma.listing.findMany({
    where: {
      city: { slug: citySlug },
      isActive: true,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      priceFrom: true,
      address: true,
      city: { select: { name: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.floor(limit / 3)
  })

  const newEvents = events.map(event => {
    const computedMinPrice = getMinActivePrice(event.tickets, event.isPaid)
    const finalPrice = computedMinPrice !== null ? computedMinPrice : event.minPrice

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.coverImage,
        date: event.startDate,
      location: event.venue,
      organizer: event.organizer,
      price: finalPrice,
      city: event.city,
      category: event.category?.name,
      type: 'EVENT',
      isPaid: false
    }
  })

  const newVenues = venues.map(venue => {
    // Рассчитываем средний рейтинг
    const averageRating = venue.reviews.length > 0 
      ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length
      : 0

    return {
      id: venue.id.toString(),
      title: venue.name,
      description: venue.description,
      image: venue.coverImage,
      location: venue.address,
      district: venue.district,
      metro: venue.metro,
      price: venue.priceFrom,
      city: venue.city.name,
      type: 'VENUE',
      isPaid: false,
      subcategory: venue.subcategory,
      averageRating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
      reviewsCount: venue.reviews.length
    }
  })

  const newServices = services.map(service => ({
    id: service.id.toString(),
    title: service.title,
    description: service.description,
    image: service.images ? JSON.parse(service.images)[0] : null,
    price: service.priceFrom,
    location: service.address,
    category: service.category.name,
    city: service.city.name,
    type: 'SERVICE',
    isPaid: false
  }))

  const allNew = [...newEvents, ...newVenues, ...newServices]
  return allNew.slice(0, limit)
}