import { getServerSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import prisma from "@/lib/db"
import VendorVenuesClient from "./VendorVenuesClient"

export const dynamic = "force-dynamic"

export default async function VendorVenuesPage() {
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session: { user?: { id: string } } | null = null
  if (sessionCookie) {
    try {
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      session = await getServerSession(mockRequest)
    } catch (error) {
      console.log('Vendor venues: getServerSession error:', error)
      session = null
    }
  }
  
  if (!session?.user?.id) {
    redirect("/?login=true")
  }

  // Получаем данные вендора и его места
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) },
    include: {
      venuePartners: {
        include: {
          subcategory: {
            select: {
              name: true,
              slug: true,
              type: true
            }
          },
          city: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!vendor) {
    redirect("/vendor/register")
  }

  // Получаем доступные подкатегории для создания новых мест
  const subcategories = await prisma.venueSubcategory.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return <VendorVenuesClient vendor={vendor as any} subcategories={subcategories} />
}
