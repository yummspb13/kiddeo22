import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import VendorRegisterClient from "./VendorRegisterClient"

export const dynamic = "force-dynamic"

export default async function VendorRegisterPage() {
  console.log('🔍 VENDOR REGISTER: Page started')
  
  const session = await getServerSession()
  console.log('🔍 VENDOR REGISTER: Session', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 VENDOR REGISTER: No session, redirecting to signin')
    redirect("/?login=true")
  }

  // Проверяем, есть ли уже вендор
  console.log('🔍 VENDOR REGISTER: Checking for existing vendor for userId', session.user.uid)
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: session.user.uid },
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
