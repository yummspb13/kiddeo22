import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        setIsIntersecting(isElementIntersecting)

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }

        if (freezeOnceVisible && hasIntersected) {
          observer.unobserve(element)
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, hasIntersected])

  return [elementRef, isIntersecting]
}

// Hook for lazy loading with intersection observer
export function useLazyLoad(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement>, boolean, boolean] {
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    ...options
  })
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isIntersecting, hasLoaded])

  return [elementRef, isIntersecting, hasLoaded]
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    ...options
  })

  useEffect(() => {
    if (isIntersecting) {
      callback()
    }
  }, [isIntersecting, callback])

  return [elementRef, isIntersecting]
}

// Hook for visibility-based animations
export function useVisibilityAnimation(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.2,
    ...options
  })

  return [elementRef, isIntersecting]
}
