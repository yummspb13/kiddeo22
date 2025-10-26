import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-server"
import ContentDashboard from "./ContentDashboard"

export default async function ContentPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <ContentDashboard user={session.user} />
}
