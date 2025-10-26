import { getServerSession  } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import ListingClaimsClient from "./ListingClaimsClient"

export const dynamic = "force-dynamic"

export default async function ListingClaimsPage() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Проверяем, что пользователь админ (здесь можно добавить проверку роли)
  // Пока просто проверяем наличие сессии

  return <ListingClaimsClient />
}
