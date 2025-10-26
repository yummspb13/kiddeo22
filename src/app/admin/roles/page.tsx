import RolesClient from "./RolesClient"

interface RolesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const params = await searchParams
  const key = params.key as string || ''
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''

  return <RolesClient keySuffix={keySuffix} />
}