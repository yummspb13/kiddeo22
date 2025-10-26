import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import VendorRegisterClient from "./VendorRegisterClient"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function VendorRegisterPage() {
  console.log('🔍 VENDOR REGISTER: Page started')
  
  // Получаем cookies для передачи в getServerSession
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  console.log('🔍 VENDOR REGISTER: Session cookie exists:', !!sessionCookie)
  
  const session = await getServerSession()
  console.log('🔍 VENDOR REGISTER: Session', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 VENDOR REGISTER: No session, redirecting to signin')
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
    console.log('🔍 VENDOR REGISTER: Vendor exists, redirecting to dashboard')
    redirect("/vendor/dashboard")
  }

  console.log('🔍 VENDOR REGISTER: No existing vendor, proceeding with registration page')

  // Получаем города для выбора
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    orderBy: { name: 'asc' }
  })

  return <VendorRegisterClient cities={cities} />
}
