import AuditLogClient from "./AuditLogClient"

interface AuditLogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const params = await searchParams
  const key = params.key as string || ''
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''

  return <AuditLogClient keySuffix={keySuffix} />
}
