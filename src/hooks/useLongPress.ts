import { useRef, useCallback, useEffect, useState } from 'react'

interface UseLongPressOptions {
  threshold?: number // Duration in milliseconds
  preventDefault?: boolean
  stopPropagation?: boolean
  onStart?: () => void
  onFinish?: () => void
  onCancel?: () => void
}

export function useLongPress(
  onLongPress: () => void,
  options: UseLongPressOptions = {}
) {
  const {
    threshold = 500,
    preventDefault = true,
    stopPropagation = false,
    onStart,
    onFinish,
    onCancel
  } = options

  const [isLongPressing, setIsLongPressing] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement>(null)

  const start = useCallback((e: TouchEvent | MouseEvent) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    
    setIsPressed(true)
    startTimeRef.current = Date.now()
    onStart?.()
    
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true)
      onLongPress()
      onFinish?.()
    }, threshold)
  }, [threshold, preventDefault, stopPropagation, onLongPress, onStart, onFinish])

  const cancel = useCallback((e: TouchEvent | MouseEvent) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsPressed(false)
    setIsLongPressing(false)
    startTimeRef.current = null
    onCancel?.()
  }, [preventDefault, stopPropagation, onCancel])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    start(e)
  }, [start])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    cancel(e)
  }, [cancel])

  const handleTouchCancel = useCallback((e: TouchEvent) => {
    cancel(e)
  }, [cancel])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    start(e)
  }, [start])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    cancel(e)
  }, [cancel])

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    cancel(e)
  }, [cancel])

  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: !preventDefault })
    
    // Mouse events (for desktop testing)
    element.addEventListener('mousedown', handleMouseDown)
    element.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    // Prevent context menu on long press
    element.addEventListener('contextmenu', handleContextMenu)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('contextmenu', handleContextMenu)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchCancel, handleMouseDown, handleMouseUp, handleMouseLeave, handleContextMenu, preventDefault])

  return {
    elementRef,
    isPressed,
    isLongPressing,
    duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0
  }
}

// Hook for context menu on long press
export function useContextMenu(
  onContextMenu: () => void,
  options: UseLongPressOptions = {}
) {
  return useLongPress(onContextMenu, {
    threshold: 500,
    ...options
  })
}

// Hook for selection mode on long press
export function useSelectionMode(
  onEnterSelection: () => void,
  options: UseLongPressOptions = {}
) {
  return useLongPress(onEnterSelection, {
    threshold: 800,
    ...options
  })
}

// Hook for haptic feedback on long press
export function useHapticLongPress(
  onLongPress: () => void,
  options: UseLongPressOptions & { hapticType?: 'light' | 'medium' | 'heavy' } = {}
) {
  const { hapticType = 'medium', ...longPressOptions } = options

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      }
      navigator.vibrate(patterns[hapticType])
    }
  }, [hapticType])

  const { elementRef, isPressed, isLongPressing, duration } = useLongPress(
    () => {
      triggerHaptic()
      onLongPress()
    },
    {
      ...longPressOptions,
      onFinish: () => {
        triggerHaptic()
        longPressOptions.onFinish?.()
      }
    }
  )

  return {
    elementRef,
    isPressed,
    isLongPressing,
    duration
  }
}
