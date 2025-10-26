'use client'

import { useEffect } from 'react'

export default function Pwa() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const url = '/sw.js'
    navigator.serviceWorker
      .register(url)
      .catch((e) => console.debug('[sw] register error', e))
  }, [])

  return null
}
