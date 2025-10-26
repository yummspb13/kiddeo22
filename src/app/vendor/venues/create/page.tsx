import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import CreateVenueClient from "./CreateVenueClient"
import { cookies } from 'next/headers'

export const dynamic = "force-dynamic"

export default async function CreateVenuePage() {
  console.log('🔍 CREATE VENUE PAGE: Starting page load')
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session = null
  if (sessionCookie) {
    try {
      console.log('🔍 CREATE VENUE PAGE: Session cookie found, calling getServerSession...')
      
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      session = await getServerSession(mockRequest)
      console.log('🔍 CREATE VENUE PAGE: getServerSession result:', session)
    } catch (error) {
      console.log('🔍 CREATE VENUE PAGE: getServerSession error:', error)
      session = null
    }
  } else {
    console.log('🔍 CREATE VENUE PAGE: No session cookie found')
  }
  
  console.log('🔍 CREATE VENUE PAGE: Session check', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 CREATE VENUE PAGE: No session, redirecting to login')
    redirect("/?login=true")
  }

  // Проверяем, что пользователь является вендором
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) }
  })

  if (!vendor) {
    redirect("/vendor/register")
  }

  // Получаем информацию о тарифе вендора (пока используем FREE по умолчанию)
  // В будущем здесь будет запрос к API для получения актуального тарифа
  const vendorTariff = 'FREE' as const

  // Получаем доступные подкатегории и города
  const [subcategories, cities] = await Promise.all([
    prisma.venueSubcategory.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.city.findMany({
      where: { isPublic: true },
      orderBy: { name: 'asc' }
    })
  ])

  return <CreateVenueClient vendor={vendor} subcategories={subcategories} cities={cities} vendorTariff={vendorTariff} />
}
