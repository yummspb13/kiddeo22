import { getServerSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import PendingVendorsClient from "./PendingVendorsClient"
import { requireAdminOrDevKey } from "@/lib/admin-guard"

export const dynamic = "force-dynamic"

export default async function PendingVendorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminOrDevKey(searchParams, "admin")
  
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Получаем вендоров на модерации
  const pendingVendors = await prisma.vendor.findMany({
    where: {
      kycStatus: 'SUBMITTED'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      },
      city: {
        select: {
          id: true,
          name: true
        }
      },
      VendorOnboarding: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <PendingVendorsClient vendors={pendingVendors as any} />
}
