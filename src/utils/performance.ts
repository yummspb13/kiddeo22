/**
 * Performance utilities for mobile optimization
 */

// Debounce function for scroll and resize events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Check if element is in viewport
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Get device type based on screen size
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Get optimal image size based on device and container
export function getOptimalImageSize(
  containerWidth: number,
  devicePixelRatio: number = 1,
  maxWidth: number = 1920
): { width: number; height: number } {
  const deviceType = getDeviceType()
  const baseWidth = Math.min(containerWidth * devicePixelRatio, maxWidth)
  
  // Different aspect ratios for different content types
  const aspectRatios = {
    mobile: { card: 16/9, hero: 21/9, gallery: 4/3 },
    tablet: { card: 16/10, hero: 21/9, gallery: 16/9 },
    desktop: { card: 16/10, hero: 21/9, gallery: 16/9 }
  }
  
  const ratio = aspectRatios[deviceType].card
  return {
    width: Math.round(baseWidth),
    height: Math.round(baseWidth / ratio)
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  
  if (as === 'image') {
    link.crossOrigin = 'anonymous'
  }
  
  document.head.appendChild(link)
}

// Prefetch next page resources
export function prefetchPage(href: string): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now())
    }
  }
  
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance === 'undefined') return null
    
    const startTime = this.marks.get(startMark)
    if (!startTime) return null
    
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    if (!endTime) return null
    
    const duration = endTime - startTime
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  // Web Vitals measurement
  measureWebVitals(): void {
    if (typeof window === 'undefined') return
    
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Image optimization helpers
export function getImageSrcSet(
  baseUrl: string,
  sizes: number[] = [375, 640, 768, 1024, 1280, 1536]
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
}

export function getImageSizes(breakpoints: string[] = [
  '(max-width: 375px) 100vw',
  '(max-width: 640px) 100vw', 
  '(max-width: 768px) 50vw',
  '(max-width: 1024px) 33vw',
  '25vw'
]): string {
  return breakpoints.join(', ')
}

// Memory usage monitoring
export function getMemoryUsage(): any {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    }
  }
  return null
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const memory = getMemoryUsage()
  if (memory && memory.limit < 100 * 1024 * 1024) return true // Less than 100MB
  
  const cores = navigator.hardwareConcurrency || 4
  if (cores < 4) return true
  
  return false
}

// Adaptive loading based on device capabilities
export function shouldLoadHighResImages(): boolean {
  const deviceType = getDeviceType()
  const isLowEnd = isLowEndDevice()
  
  if (isLowEnd) return false
  if (deviceType === 'mobile') return false
  return true
}

// Network-aware loading
export function getConnectionType(): 'slow-2g' | '2g' | '3g' | '4g' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown'
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  if (!connection) return 'unknown'
  
  return connection.effectiveType || 'unknown'
}

export function shouldPreloadResources(): boolean {
  const connectionType = getConnectionType()
  return connectionType === '4g' || connectionType === 'unknown'
}
