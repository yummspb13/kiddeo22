import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-server"
import ContentSettings from "./ContentSettings"

export default async function SettingsPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <ContentSettings user={session.user} />
}
