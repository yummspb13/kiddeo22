// src/lib/vendor-guard.ts
import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"

export async function requireVendorAccess(userId?: string | number) {
  const session = await getServerSession()
  
  if (!session?.user?.id && !userId) {
    redirect("/auth/signin")
  }

  const targetUserId = userId || session?.user?.id

  // Проверяем, что пользователь является вендором
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(String(targetUserId)) },
    include: {
      user: true,
      city: true
    }
  })

  if (!vendor) {
    if (userId) {
      return null
    }
    redirect("/vendor/onboarding")
  }

  return vendor
}

export async function requireVendorOrRedirect() {
  try {
    return await requireVendorAccess()
  } catch (error) {
    redirect("/vendor/onboarding")
  }
}
