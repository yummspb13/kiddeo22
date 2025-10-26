import { getServerSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import VenueDashboardClient from "./VenueDashboardClient"

export const dynamic = "force-dynamic"

export default async function VenueDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    
    console.log('🔍 VENUE DASHBOARD: Starting page load for venue ID:', id)
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  console.log('🔍 VENUE DASHBOARD: Session cookie check:', { hasCookie: !!sessionCookie })
  
  let session: { user?: { id: string } } | null = null
  if (sessionCookie) {
    try {
      console.log('🔍 VENUE DASHBOARD: Session cookie found, calling getServerSession...')
      
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      session = await getServerSession(mockRequest)
      console.log('🔍 VENUE DASHBOARD: getServerSession result:', session)
    } catch (error) {
      console.log('🔍 VENUE DASHBOARD: getServerSession error:', error)
      session = null
    }
  } else {
    console.log('🔍 VENUE DASHBOARD: No session cookie found')
  }
  
  console.log('🔍 VENUE DASHBOARD: Final session check:', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 VENUE DASHBOARD: No session, redirecting to login')
    redirect("/?login=true")
  }

  // Получаем вендора
  console.log('🔍 VENUE DASHBOARD: Looking up vendor for user:', session.user.id)
  const vendorStartTime = Date.now()
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) },
    select: { id: true, displayName: true }
  })
  console.log('🔍 VENUE DASHBOARD: Vendor lookup completed in', Date.now() - vendorStartTime, 'ms')

  if (!vendor) {
    console.log('🔍 VENUE DASHBOARD: Vendor not found, redirecting to register')
    redirect("/vendor/register")
  }

  console.log('🔍 VENUE DASHBOARD: Found vendor:', vendor.id)

  // Получаем место
  console.log('🔍 VENUE DASHBOARD: Looking up venue:', id, 'for vendor:', vendor.id)
  console.log('🔍 VENUE DASHBOARD: ID type:', typeof id, 'Value:', id)
  
  // Убеждаемся, что id - это строка
  const venueId = typeof id === 'string' ? parseInt(id) : id
  console.log('🔍 VENUE DASHBOARD: Parsed venue ID:', venueId)
  
  const venueStartTime = Date.now()
  const venue = await prisma.venuePartner.findFirst({
    where: {
      id: venueId,
      vendorId: vendor.id
    },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      description: true,
      coverImage: true,
      additionalImages: true,
      status: true,
      createdAt: true,
      district: true,
      metro: true,
      lat: true,
      lng: true,
      tariff: true,
      priceFrom: true,
      ageFrom: true,
      workingHours: true,
      richDescription: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          category: {
            select: {
              name: true
            }
          }
        }
      },
      city: {
        select: {
          name: true,
          slug: true
        }
      },
      parameters: {
        select: {
          value: true,
          parameter: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })
  console.log('🔍 VENUE DASHBOARD: Venue lookup completed in', Date.now() - venueStartTime, 'ms')

  if (!venue) {
    console.log('🔍 VENUE DASHBOARD: Venue not found, redirecting to venues list')
    redirect("/vendor/venues")
  }

  console.log('🔍 VENUE DASHBOARD: Found venue:', venue.name)

  // Получаем тариф места
  const currentTariff = venue.tariff as 'FREE' | 'SUPER' | 'MAXIMUM'

  // Получаем аналитику места
  console.log('🔍 VENUE DASHBOARD: Fetching analytics for venue:', venueId)
  const analyticsStartTime = Date.now()
  
  // Получаем общее количество просмотров
  const totalViewsResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM VenueView WHERE venueId = ${venueId}` as any[]
  const totalViews = totalViewsResult[0]?.count || 0
  
  // Получаем отзывы и рейтинг
  const reviewsData = await prisma.venueReview.findMany({
    where: { 
      venueId: venueId,
      status: 'APPROVED'
    },
    select: {
      rating: true
    }
  })
  
  const reviewsCount = reviewsData.length
  const averageRating = reviewsCount > 0 
    ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsCount).toFixed(1)
    : '0.0'
  
  console.log('🔍 VENUE DASHBOARD: Analytics completed in', Date.now() - analyticsStartTime, 'ms')
  console.log('🔍 VENUE DASHBOARD: Analytics data:', { totalViews, reviewsCount, averageRating })

  // Обрабатываем additionalImages как JSON и features
  console.log('🔍 VENUE DASHBOARD: venue.parameters:', venue.parameters)
  console.log('🔍 VENUE DASHBOARD: venue.parameters length:', venue.parameters?.length)
  console.log('🔍 VENUE DASHBOARD: venue.parameters type:', typeof venue.parameters)
  
  const featuresParam = venue.parameters?.find(p => p.parameter?.name === 'FEATURES_JSON')
  const features = featuresParam?.value ? JSON.parse(featuresParam.value) : []
  
  console.log('🔍 VENUE DASHBOARD: featuresParam:', featuresParam)
  console.log('🔍 VENUE DASHBOARD: features:', features)
  
  const processedVenue = {
    ...venue,
    additionalImages: venue.additionalImages ? JSON.parse(venue.additionalImages as string) : [],
    features: features
  } as any

  // Подготавливаем данные аналитики
  const analyticsData = {
    totalViews,
    reviewsCount,
    averageRating: parseFloat(averageRating)
  }

  return <VenueDashboardClient venue={processedVenue} currentTariff={currentTariff} analytics={analyticsData} />
  
  } catch (error) {
    console.error('🔍 VENUE DASHBOARD: Error loading page:', error)
    redirect("/vendor/venues")
  }
}
