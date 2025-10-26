import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-server"
import ContentAnalytics from "./ContentAnalytics"

export default async function AnalyticsPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <ContentAnalytics user={session.user} />
}
