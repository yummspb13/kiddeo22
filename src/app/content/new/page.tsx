import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-server"
import ContentEditor from "./ContentEditor"

export default async function NewContentPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <ContentEditor user={session.user} />
}
