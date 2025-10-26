import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"
import prisma from "@/lib/db"
import VendorRegisterClient from "./VendorRegisterClient"

export const dynamic = "force-dynamic"

export default async function VendorRegisterPage() {
  console.log('🔍 VENDOR REGISTER: Page started')
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session = null
  if (sessionCookie) {
    try {
      const payload = await verifyJWT(sessionCookie.value)
      if (payload) {
        session = {
          user: {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role
          }
        }
      }
    } catch (error) {
      console.error('JWT verification error:', error)
    }
  }
  
  console.log('🔍 VENDOR REGISTER: Session', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 VENDOR REGISTER: No session, redirecting to home with login modal')
    redirect("/?login=true")
  }

  // Проверяем, есть ли уже вендор
  console.log('🔍 VENDOR REGISTER: Checking for existing vendor for userId', session.user.id)
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) },
    include: {
      VendorOnboarding: true
    }
  })

  console.log('🔍 VENDOR REGISTER: existingVendor', existingVendor)

  if (existingVendor) {
    console.log('🔍 VENDOR REGISTER: Vendor exists, checking onboarding status')
    if (existingVendor.VendorOnboarding?.isCompleted) {
      console.log('🔍 VENDOR REGISTER: Onboarding completed, redirecting to dashboard')
      redirect("/vendor/dashboard")
    } else {
      console.log('🔍 VENDOR REGISTER: Onboarding not completed, redirecting to onboarding')
      redirect("/vendor/onboarding")
    }
  }

  console.log('🔍 VENDOR REGISTER: No existing vendor, proceeding with registration page')

  // Получаем города для выбора
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    orderBy: { name: 'asc' }
  })

  return <VendorRegisterClient cities={cities} />
}
