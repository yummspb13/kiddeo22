'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AdPlacement {
  id: number
  title: string
  imageUrl: string | null
  hrefUrl: string | null
  position: string
  weight: number
}

interface AdSlotProps {
  position: 'HEADER_BANNER' | 'SIDEBAR' | 'INLINE'
  citySlug: string
  className?: string
  style?: React.CSSProperties
}

export default function AdSlot({ position, citySlug, className = '', style }: AdSlotProps) {
  const [adPlacement, setAdPlacement] = useState<AdPlacement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAd = async () => {
      try {
        const response = await fetch(`/api/ads/placement?position=${position}&city=${citySlug}`)
        if (response.ok) {
          const data = await response.json()
          setAdPlacement(data)
        }
      } catch (error) {
        console.error('Error loading ad placement:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAd()
  }, [position, citySlug])

  if (loading) {
    return <div className={`bg-gray-100 animate-pulse ${className}`} />
  }

  if (!adPlacement || !adPlacement.imageUrl) {
    return null
  }

  const adContent = (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Image 
        src={adPlacement.imageUrl} 
        alt={adPlacement.title}
        width={position === 'HEADER_BANNER' ? 1200 : (position === 'HERO_BELOW' ? 800 : 400)}
        height={position === 'HEADER_BANNER' ? 70 : (position === 'HERO_BELOW' ? 256 : (position === 'INLINE' ? 150 : 260))}
        className="w-full h-full object-cover"
        style={{ 
          width: '100%', 
          height: position === 'HEADER_BANNER' ? '70px' : (position === 'HERO_BELOW' ? '256px' : (position === 'INLINE' ? '150px' : '260px'))
        }}
      />
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Реклама
      </div>
    </div>
  )

  // For INLINE position, don't wrap in Link to avoid nested <a> tags
  if (position === 'INLINE') {
    return adContent
  }

  if (adPlacement.hrefUrl) {
    return (
      <Link 
        href={adPlacement.hrefUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        {adContent}
      </Link>
    )
  }

  return adContent
}

// Специальные компоненты для каждого типа рекламного слота

export function HeaderBannerAd({ citySlug }: { citySlug: string }) {
  return (
    <AdSlot 
      position="HEADER_BANNER" 
      citySlug={citySlug}
      className="w-full rounded-2xl shadow-lg"
      style={{ height: '70px' }}
    />
  )
}

export function SidebarAd({ citySlug }: { citySlug: string }) {
  return (
    <AdSlot 
      position="SIDEBAR" 
      citySlug={citySlug}
      className="w-[400px] h-[260px] rounded-2xl"
    />
  )
}

export function InlineAd({ citySlug }: { citySlug: string }) {
  return (
    <AdSlot 
      position="INLINE" 
      citySlug={citySlug}
      className="w-[400px] h-[150px] rounded-2xl"
    />
  )
}

export function HeroBelowAd({ citySlug }: { citySlug: string }) {
  return (
    <AdSlot 
      position="HERO_BELOW" 
      citySlug={citySlug}
      className="w-full h-64 rounded-2xl shadow-lg"
    />
  )
}