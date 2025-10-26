import ModerationAnalyticsClient from "./ModerationAnalyticsClient"

interface ModerationAnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export default async function ModerationAnalyticsPage({ searchParams }: ModerationAnalyticsPageProps) {
  const params = await searchParams
  const key = params.key as string || ''
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''

  return <ModerationAnalyticsClient keySuffix={keySuffix} />
}
