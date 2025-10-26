import { useRef, useCallback, useEffect, useState } from 'react'

interface SwipeDirection {
  x: number
  y: number
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
}

interface UseSwipeOptions {
  threshold?: number // Minimum distance for swipe
  velocityThreshold?: number // Minimum velocity for swipe
  preventDefault?: boolean
  stopPropagation?: boolean
  onSwipeStart?: (direction: SwipeDirection) => void
  onSwipeMove?: (direction: SwipeDirection) => void
  onSwipeEnd?: (direction: SwipeDirection) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefault = true,
    stopPropagation = false,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options

  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null)
  
  const startPos = useRef<{ x: number; y: number; time: number } | null>(null)
  const currentPos = useRef<{ x: number; y: number; time: number } | null>(null)
  const elementRef = useRef<HTMLElement>(null)

  const getSwipeDirection = useCallback((start: { x: number; y: number; time: number }, end: { x: number; y: number; time: number }): SwipeDirection => {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const deltaTime = end.time - start.time
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime
    
    let direction: 'left' | 'right' | 'up' | 'down' | null = null
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }
    
    return {
      x: deltaX,
      y: deltaY,
      direction,
      distance,
      velocity
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    
    const touch = e.touches[0]
    const now = Date.now()
    
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }
    
    currentPos.current = { ...startPos.current }
    setIsSwipeActive(true)
  }, [preventDefault, stopPropagation])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startPos.current || !isSwipeActive) return
    
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    
    const touch = e.touches[0]
    const now = Date.now()
    
    currentPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }
    
    const direction = getSwipeDirection(startPos.current, currentPos.current)
    setSwipeDirection(direction)
    
    onSwipeMove?.(direction)
  }, [isSwipeActive, preventDefault, stopPropagation, getSwipeDirection, onSwipeMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startPos.current || !currentPos.current || !isSwipeActive) return
    
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    
    const direction = getSwipeDirection(startPos.current, currentPos.current)
    
    // Check if swipe meets threshold and velocity requirements
    if (direction.distance >= threshold && direction.velocity >= velocityThreshold) {
      onSwipeEnd?.(direction)
      
      // Trigger specific direction callbacks
      switch (direction.direction) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }
    }
    
    // Reset
    startPos.current = null
    currentPos.current = null
    setIsSwipeActive(false)
    setSwipeDirection(null)
  }, [isSwipeActive, preventDefault, stopPropagation, threshold, velocityThreshold, getSwipeDirection, onSwipeEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault])

  return {
    elementRef,
    isSwipeActive,
    swipeDirection
  }
}

// Hook for horizontal swipe (carousel, tabs)
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: Omit<UseSwipeOptions, 'onSwipeLeft' | 'onSwipeRight'> = {}
) {
  return useSwipe({
    ...options,
    onSwipeLeft,
    onSwipeRight
  })
}

// Hook for vertical swipe (pull-to-refresh, dismiss)
export function useVerticalSwipe(
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options: Omit<UseSwipeOptions, 'onSwipeUp' | 'onSwipeDown'> = {}
) {
  return useSwipe({
    ...options,
    onSwipeUp,
    onSwipeDown
  })
}

// Hook for swipe actions (like iOS)
export function useSwipeActions(
  leftAction?: { label: string; action: () => void; color?: string },
  rightAction?: { label: string; action: () => void; color?: string },
  options: UseSwipeOptions = {}
) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isLeftActionVisible, setIsLeftActionVisible] = useState(false)
  const [isRightActionVisible, setIsRightActionVisible] = useState(false)

  const { elementRef, isSwipeActive, swipeDirection } = useSwipe({
    ...options,
    onSwipeMove: (direction) => {
      setSwipeOffset(direction.x)
      
      if (direction.direction === 'right' && direction.distance > 50) {
        setIsLeftActionVisible(true)
        setIsRightActionVisible(false)
      } else if (direction.direction === 'left' && direction.distance > 50) {
        setIsRightActionVisible(true)
        setIsLeftActionVisible(false)
      } else {
        setIsLeftActionVisible(false)
        setIsRightActionVisible(false)
      }
    },
    onSwipeEnd: (direction) => {
      if (direction.distance >= 100) {
        if (direction.direction === 'right' && leftAction) {
          leftAction.action()
        } else if (direction.direction === 'left' && rightAction) {
          rightAction.action()
        }
      }
      
      // Reset
      setSwipeOffset(0)
      setIsLeftActionVisible(false)
      setIsRightActionVisible(false)
    }
  })

  return {
    elementRef,
    isSwipeActive,
    swipeDirection,
    swipeOffset,
    isLeftActionVisible,
    isRightActionVisible,
    leftAction,
    rightAction
  }
}
