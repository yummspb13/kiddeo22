import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import UpgradeToProClient from './UpgradeToProClient'

interface UpgradeToProPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export default async function UpgradeToProPage({ searchParams }: UpgradeToProPageProps) {
  const session = await getServerSession()
  
  if (!session?.user?.uid) {
    redirect('/?login=true')
  }

  const userId = parseInt(session.user.uid as string)
  
  // Находим вендора
  const vendor = await prisma.vendor.findFirst({
    where: { userId },
    include: {
      vendorRole: true,
      bankAccounts: true,
      taxProfiles: true,
      documents: true
    }
  })

  if (!vendor) {
    redirect('/vendor/dashboard')
  }

  if (vendor.type === 'PRO') {
    redirect('/vendor/dashboard')
  }

  return <UpgradeToProClient vendor={vendor} />
}