// src/app/vendor/onboarding/page.tsx
import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import VendorOnboardingClient from "./VendorOnboardingClient"
import VendorModerationWaiting from "./VendorModerationWaiting"

export const dynamic = "force-dynamic"

export default async function VendorOnboardingPage() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    redirect("/?login=true")
  }

  // Проверяем, есть ли уже вендор
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: session.user.uid },
    include: {
      VendorOnboarding: true
    }
  })

  console.log('Vendor onboarding page: existingVendor', existingVendor)

  if (!existingVendor) {
    console.log('No vendor found, redirecting to register')
    redirect("/vendor/register")
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