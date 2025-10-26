// src/app/vendor/dashboard/page.tsx
import { getServerSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import prisma from "@/lib/db"
import VendorDashboardClient from "./VendorDashboardClient"

export const dynamic = "force-dynamic"

export default async function VendorDashboardPage() {
  console.log('🔍 VENDOR DASHBOARD: Page started')
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session: { user?: { id: string } } | null = null
  if (sessionCookie) {
    try {
      console.log('🔍 VENDOR DASHBOARD: Session cookie found, calling getServerSession...')
      
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      console.log('🔍 VENDOR DASHBOARD: About to call getServerSession')
      
      // Добавляем таймаут для getServerSession
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getServerSession timeout')), 5000)
      )
      
      session = await Promise.race([
        getServerSession(mockRequest),
        timeoutPromise
      ]) as any
      
      console.log('🔍 VENDOR DASHBOARD: getServerSession completed, result:', session)
    } catch (error) {
      console.log('🔍 VENDOR DASHBOARD: getServerSession error:', error)
      // Если getServerSession не работает, пробуем альтернативный способ
      session = null
    }
  } else {
    console.log('🔍 VENDOR DASHBOARD: No session cookie found')
  }
  
  // Альтернативный способ проверки сессии через API
  if (!session) {
    try {
      console.log('🔍 VENDOR DASHBOARD: Trying alternative session check via API...')
      const response = await fetch('http://localhost:3000/api/auth/session', {
        headers: {
          'Cookie': `session=${sessionCookie?.value || ''}`
        }
      })
      const sessionData = await response.json()
      console.log('🔍 VENDOR DASHBOARD: API session result:', sessionData)
      if (sessionData.user) {
        session = sessionData
      }
    } catch (error) {
      console.log('🔍 VENDOR DASHBOARD: API session check failed:', error)
    }
  }
  
  console.log('🔍 VENDOR DASHBOARD: Session', { hasSession: !!session, userId: session?.user?.id })
  console.log('🔍 VENDOR DASHBOARD: Session user object', session?.user)
  console.log('🔍 VENDOR DASHBOARD: Session user id type', typeof session?.user?.id)
  console.log('🔍 VENDOR DASHBOARD: Session user id value', session?.user?.id)
  
  // Детальная проверка session.user.id
  console.log('🔍 VENDOR DASHBOARD: Detailed session check:', {
    session: !!session,
    user: !!session?.user,
    userId: session?.user?.id,
    userIdType: typeof session?.user?.id,
    userIdValue: session?.user?.id,
    isUserIdTruthy: !!session?.user?.id,
    isUserIdFalsy: !session?.user?.id
  })
  
  if (!session?.user?.id) {
    console.log('🔍 VENDOR DASHBOARD: No session, redirecting to home with login modal')
    redirect("/?login=true")
  }

  // Получаем данные вендора
  console.log('🔍 VENDOR DASHBOARD: About to query vendor with userId:', parseInt(session.user.id))
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) },
    include: {
      vendorRole: {
        include: {
          moderator: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      city: true,
      VendorOnboarding: true,
      venuePartners: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          coverImage: true,
          status: true,
          createdAt: true,
          subcategory: {
            select: {
              name: true,
              slug: true
            }
          },
          city: {
            select: {
              name: true
            }
          }
        }
      },
      listings: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true,
          createdAt: true
        }
      },
      listingClaims: {
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      }
    }
  })

  console.log('🔍 VENDOR DASHBOARD: Vendor query result:', { vendor: !!vendor, vendorId: vendor?.id, vendorName: vendor?.displayName })
  
  if (!vendor) {
    console.log('🔍 VENDOR DASHBOARD: No vendor found, redirecting to register')
    redirect("/vendor/register")
  }

  // Получаем города для формы повторной отправки
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    orderBy: { name: 'asc' }
  })

  // Не перенаправляем на онбординг - показываем дашборд с информацией о статусе

  return <VendorDashboardClient vendor={vendor as any} cities={cities} />
}
