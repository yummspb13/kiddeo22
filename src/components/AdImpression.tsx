'use client'
import { useEffect } from 'react'

export default function AdImpression({ adId, cityId }: { adId: number, cityId?: number | null }) {
  useEffect(() => {
    const ctrl = new AbortController()
    // простой маяк; если хочешь — добавим IntersectionObserver для «видимости»
    fetch('/api/ads/imp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ adId, cityId: cityId ?? null }),
      signal: ctrl.signal,
    }).catch(() => {})
    return () => ctrl.abort()
  }, [adId, cityId])

  return null
}
