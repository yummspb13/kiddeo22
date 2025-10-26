'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type GalleryProps = {
  images: string[]
  variant?: 'slider' | 'grid'
}

export default function Gallery({ images, variant = 'slider' }: GalleryProps) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images])
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const nextImage = () => {
    setActive((prev) => (prev + 1) % safeImages.length)
  }

  const prevImage = () => {
    setActive((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

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
          <div className="fixed inset-0 z-[99999] bg-white/20 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightbox(null)}>
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
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 group will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={safeImages[active]} alt="active" className="w-full h-full object-cover" />
        
        {/* Кнопки навигации с градиентными уголками */}
        {safeImages.length > 1 && (
          <>
            {/* Градиентные уголки при наведении - размещаем ПОД кнопками */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
            
            {/* Левая кнопка */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 z-20"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            {/* Правая кнопка */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 z-20"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
        
        {/* Индикаторы внизу */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {safeImages.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-1.5 w-5 rounded-full transition-all duration-200 ${i === active ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`} />
            ))}
          </div>
        )}
      </div>
      
      {/* Миниатюры */}
      {safeImages.length > 1 && (
        <div className="mt-2 hidden sm:grid grid-cols-5 gap-2">
          {safeImages.slice(0, 15).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="thumb" className={`h-16 w-full object-cover rounded-md cursor-pointer transition-all duration-200 ${i === active ? 'ring-2 ring-violet-500' : 'hover:ring-2 hover:ring-violet-300'}`} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
    </div>
  )
}


