'use client'

import { useMemo, useState } from 'react'

type GalleryProps = {
  images: string[]
  variant?: 'slider' | 'grid'
}

export default function Gallery({ images, variant = 'slider' }: GalleryProps) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images])
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (safeImages.length === 0) return null

  if (variant === 'grid') {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {safeImages.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="photo" className="w-full h-32 sm:h-40 object-cover rounded-lg cursor-pointer" onClick={() => setLightbox(idx)} />
          ))}
        </div>
        {lightbox !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setLightbox(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={safeImages[lightbox]} alt="full" className="max-w-[90vw] max-h-[90vh] object-contain" />
          </div>
        )}
      </div>
    )
  }

  // slider
  return (
    <div>
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={safeImages[active]} alt="active" className="w-full h-full object-cover" />
        {safeImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {safeImages.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-1.5 w-5 rounded-full ${i === active ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="mt-2 hidden sm:grid grid-cols-6 gap-2">
          {safeImages.slice(0, 12).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="thumb" className={`h-16 w-full object-cover rounded-md cursor-pointer ${i === active ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
    </div>
  )
}


