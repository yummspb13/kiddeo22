import { useState, useEffect, useCallback } from 'react'
import { getOptimalImageSize, getImageSrcSet, getImageSizes, shouldLoadHighResImages } from '@/utils/performance'

interface UseImageOptimizationOptions {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  sizes?: string[]
  lazy?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  srcSet?: string
  sizes?: string
  loading: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  quality?: number
}

export function useImageOptimization({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  quality = 75,
  sizes = [375, 640, 768, 1024, 1280, 1536],
  lazy = true,
  placeholder = 'blur',
  blurDataURL
}: UseImageOptimizationOptions): OptimizedImageProps {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState(src)

  // Generate optimized image URL with Next.js Image Optimization
  const generateOptimizedSrc = useCallback((baseSrc: string, w: number, h: number, q: number) => {
    // If it's already a Next.js optimized URL, return as is
    if (baseSrc.includes('/_next/image')) {
      return baseSrc
    }

    // For external images, use Next.js Image Optimization API
    const params = new URLSearchParams({
      url: baseSrc,
      w: w.toString(),
      h: h.toString(),
      q: q.toString(),
      f: 'webp' // Prefer WebP format
    })

    return `/_next/image?${params.toString()}`
  }, [])

  // Calculate optimal dimensions
  const optimalSize = getOptimalImageSize(width, window?.devicePixelRatio || 1)
  const shouldLoadHighRes = shouldLoadHighResImages()

  useEffect(() => {
    const newSrc = generateOptimizedSrc(
      src,
      optimalSize.width,
      optimalSize.height,
      shouldLoadHighRes ? quality : Math.max(quality - 20, 50)
    )
    setOptimizedSrc(newSrc)
  }, [src, optimalSize.width, optimalSize.height, quality, shouldLoadHighRes, generateOptimizedSrc])

  // Generate srcSet for responsive images
  const srcSet = getImageSrcSet(src, sizes)
  const sizesAttr = getImageSizes()

  return {
    src: optimizedSrc,
    alt,
    width: optimalSize.width,
    height: optimalSize.height,
    srcSet,
    sizes: sizesAttr,
    loading: priority ? 'eager' : (lazy ? 'lazy' : 'eager'),
    placeholder: placeholder && !priority ? placeholder : undefined,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? generateBlurDataURL() : undefined),
    quality
  }
}

// Generate a simple blur placeholder
function generateBlurDataURL(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 8, 8)
  }
  
  return canvas.toDataURL()
}

// Hook for progressive image loading
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  options: { threshold?: number } = {}
) {
  const [src, setSrc] = useState(lowQualitySrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const { threshold = 0.1 } = options

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setSrc(highQualitySrc)
      setIsLoaded(true)
    }
    img.src = highQualitySrc
  }, [highQualitySrc])

  return { src, isLoaded }
}

// Hook for image preloading
export function useImagePreload(srcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (srcs.length === 0) return

    setIsLoading(true)
    const loadPromises = srcs.map(src => 
      new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(src)
        img.onerror = () => reject(src)
        img.src = src
      })
    )

    Promise.allSettled(loadPromises).then(results => {
      const loaded = new Set<string>()
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.add(result.value)
        }
      })
      setLoadedImages(loaded)
      setIsLoading(false)
    })
  }, [srcs])

  return { loadedImages, isLoading, isLoaded: (src: string) => loadedImages.has(src) }
}

// Hook for responsive image selection
export function useResponsiveImage(
  images: { src: string; width: number; height: number }[],
  containerWidth: number
) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  useEffect(() => {
    const devicePixelRatio = window?.devicePixelRatio || 1
    const targetWidth = containerWidth * devicePixelRatio

    // Find the best matching image
    const bestMatch = images.reduce((best, current) => {
      const currentDiff = Math.abs(current.width - targetWidth)
      const bestDiff = Math.abs(best.width - targetWidth)
      return currentDiff < bestDiff ? current : best
    })

    setSelectedImage(bestMatch)
  }, [images, containerWidth])

  return selectedImage
}
