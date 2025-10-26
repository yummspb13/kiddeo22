import { requireAdminOrDevKey } from "@/lib/admin-guard"
import VendorApplicationsClient from "./VendorApplicationsClient"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function VendorApplicationsPage({ searchParams }: PageProps) {
  // Используем requireAdminOrDevKey для проверки доступа
  await requireAdminOrDevKey(searchParams, "admin")

  return <VendorApplicationsClient />
}
