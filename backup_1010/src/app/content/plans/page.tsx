import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-server"
import PublicationPlans from "./PublicationPlans"

export default async function PlansPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <PublicationPlans user={session.user} />
}
