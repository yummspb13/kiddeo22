// src/app/admin/assistant/page.tsx
import { getServerSession  } from "@/lib/auth-utils"
import { requireAdminOrDevKey } from "@/lib/admin-guard"
import AdminAssistant from "@/components/admin/AdminAssistant"

interface AdminAssistantPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminAssistantPage({ searchParams }: AdminAssistantPageProps) {
  const session = await getServerSession()
  const sp = await searchParams
  
  try {
    // Проверяем доступ администратора
    await requireAdminOrDevKey(sp)
    return <AdminAssistant />
  } catch (error) {
    return <div>Доступ запрещен. Требуются права администратора.</div>
  }
}
