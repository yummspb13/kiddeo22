// src/app/vendor/onboarding/page.tsx
import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import VendorOnboardingClient from "./VendorOnboardingClient"
import VendorModerationWaiting from "./VendorModerationWaiting"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function VendorOnboardingPage() {
  // Получаем cookies для передачи в getServerSession
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  console.log('🔍 VENDOR ONBOARDING: Starting page load')
  console.log('🔍 VENDOR ONBOARDING: Session cookie exists:', !!sessionCookie)
  
  const session = await getServerSession()
  
  console.log('🔍 VENDOR ONBOARDING: Session result:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    userEmail: session?.user?.email 
  })
  
  if (!session?.user?.id) {
    console.log('🔍 VENDOR ONBOARDING: No session, redirecting to login')
    redirect("/?login=true")
  }

  // Проверяем, есть ли уже вендор
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) }, // Конвертируем строку в число
    include: {
      VendorOnboarding: true
    }
  })

  console.log('Vendor onboarding page: existingVendor', existingVendor)

  if (!existingVendor) {
    console.log('No vendor found, redirecting to register')
    redirect('/vendor/register')
  }

  // Если онбординг уже завершен, перенаправляем на дашборд
  if (existingVendor.VendorOnboarding?.isCompleted) {
    console.log('Onboarding completed, redirecting to dashboard')
    redirect("/vendor/dashboard")
  }

  console.log('Showing onboarding for vendor', existingVendor.id, 'step', existingVendor.VendorOnboarding?.step)

  // Если вендор на модерации, показываем шаг ожидания
  if (existingVendor.kycStatus === 'SUBMITTED') {
    console.log('Vendor is under moderation, showing waiting step')
    return <VendorModerationWaiting vendor={existingVendor as any} />
  }

  // Получаем города для выбора
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    orderBy: { name: 'asc' }
  })

  return <VendorOnboardingClient cities={cities} vendor={existingVendor as any} />
}