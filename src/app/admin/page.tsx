import { redirect } from 'next/navigation'

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams
  const key = params.key as string || ''
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''
  
  // Редиректим на dashboard
  redirect(`/admin/dashboard${keySuffix}`)
}
