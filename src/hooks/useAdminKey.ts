'use client'

import { useSearchParams } from 'next/navigation'

export function useAdminKey() {
  const searchParams = useSearchParams()
  const key = searchParams.get('key')
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''
  
  return { key, keySuffix }
}
