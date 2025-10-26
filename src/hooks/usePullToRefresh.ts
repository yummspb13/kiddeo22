import { useRef, useCallback, useEffect, useState } from 'react'
import { useVerticalSwipe } from './useSwipe'

interface UsePullToRefreshOptions {
  threshold?: number // Distance in pixels to trigger refresh
  resistance?: number // How much to resist the pull (0-1)
  onRefresh: () => Promise<void> | void
  disabled?: boolean
  refreshThreshold?: number // Distance to show refresh indicator
}

interface PullToRefreshState {
  isRefreshing: boolean
  isPulling: boolean
  pullDistance: number
  canRefresh: boolean
  progress: number // 0-1
}

export function usePullToRefresh(
  options: UsePullToRefreshOptions
): [React.RefObject<HTMLElement>, PullToRefreshState] {
  const {
    threshold = 80,
    resistance = 0.5,
    onRefresh,
    disabled = false,
    refreshThreshold = 60
  } = options

  const [state, setState] = useState<PullToRefreshState>({
    isRefreshing: false,
    isPulling: false,
    pullDistance: 0,
    canRefresh: false,
    progress: 0
  })

  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement>(null)

  const updateState = useCallback((updates: Partial<PullToRefreshState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const handleRefresh = useCallback(async () => {
    if (state.isRefreshing) return

    updateState({ isRefreshing: true, isPulling: false, pullDistance: 0, canRefresh: false, progress: 0 })
    
    try {
      await onRefresh()
    } catch (error) {
      console.error('Pull to refresh failed:', error)
    } finally {
      updateState({ isRefreshing: false })
    }
  }, [state.isRefreshing, onRefresh, updateState])

  const handleSwipeStart = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return
    
    const element = elementRef.current
    if (!element) return

    // Only trigger if we're at the top of the scrollable area
    if (element.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
  }, [disabled, state.isRefreshing])

  const handleSwipeMove = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing || startY.current === null) return

    const element = elementRef.current
    if (!element) return

    // Only trigger if we're at the top of the scrollable area
    if (element.scrollTop > 0) return

    currentY.current = e.touches[0].clientY
    const pullDistance = Math.max(0, (currentY.current - startY.current) * resistance)
    const progress = Math.min(pullDistance / threshold, 1)
    const canRefresh = pullDistance >= refreshThreshold

    updateState({
      isPulling: true,
      pullDistance,
      canRefresh,
      progress
    })

    // Prevent default scrolling when pulling
    if (pullDistance > 0) {
      e.preventDefault()
    }
  }, [disabled, state.isRefreshing, threshold, resistance, refreshThreshold, updateState])

  const handleSwipeEnd = useCallback(() => {
    if (disabled || state.isRefreshing) return

    if (state.canRefresh && state.pullDistance >= threshold) {
      handleRefresh()
    } else {
      updateState({
        isPulling: false,
        pullDistance: 0,
        canRefresh: false,
        progress: 0
      })
    }

    startY.current = null
    currentY.current = null
  }, [disabled, state.isRefreshing, state.canRefresh, state.pullDistance, threshold, handleRefresh, updateState])

  // Use vertical swipe hook for touch handling
  const { elementRef: swipeRef } = useVerticalSwipe(
    undefined, // onSwipeUp
    undefined, // onSwipeDown
    {
      threshold: 0,
      velocityThreshold: 0,
      preventDefault: false,
      onSwipeStart: handleSwipeStart,
      onSwipeMove: handleSwipeMove,
      onSwipeEnd: handleSwipeEnd
    }
  )

  // Combine refs
  useEffect(() => {
    if (swipeRef.current) {
      elementRef.current = swipeRef.current
    }
  }, [swipeRef])

  return [elementRef, state]
}

// Hook for pull-to-refresh with custom indicator
export function usePullToRefreshWithIndicator(
  options: UsePullToRefreshOptions & {
    onPullStart?: () => void
    onPullMove?: (progress: number) => void
    onPullEnd?: () => void
  }
) {
  const { onPullStart, onPullMove, onPullEnd, ...pullToRefreshOptions } = options

  const [elementRef, state] = usePullToRefresh(pullToRefreshOptions)

  useEffect(() => {
    if (state.isPulling && state.pullDistance === 0) {
      onPullStart?.()
    }
  }, [state.isPulling, state.pullDistance, onPullStart])

  useEffect(() => {
    if (state.isPulling) {
      onPullMove?.(state.progress)
    }
  }, [state.isPulling, state.progress, onPullMove])

  useEffect(() => {
    if (!state.isPulling && state.pullDistance === 0) {
      onPullEnd?.()
    }
  }, [state.isPulling, state.pullDistance, onPullEnd])

  return [elementRef, state]
}

// Hook for pull-to-refresh with haptic feedback
export function useHapticPullToRefresh(
  options: UsePullToRefreshOptions & {
    hapticOnThreshold?: boolean
    hapticOnRefresh?: boolean
  }
) {
  const { hapticOnThreshold = true, hapticOnRefresh = true, ...pullToRefreshOptions } = options

  const [elementRef, state] = usePullToRefresh(pullToRefreshOptions)

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  // Haptic feedback when reaching threshold
  useEffect(() => {
    if (hapticOnThreshold && state.canRefresh && state.pullDistance >= pullToRefreshOptions.threshold!) {
      triggerHaptic('medium')
    }
  }, [state.canRefresh, state.pullDistance, pullToRefreshOptions.threshold, hapticOnThreshold, triggerHaptic])

  // Haptic feedback when refresh starts
  useEffect(() => {
    if (hapticOnRefresh && state.isRefreshing) {
      triggerHaptic('heavy')
    }
  }, [state.isRefreshing, hapticOnRefresh, triggerHaptic])

  return [elementRef, state]
}

// Hook for pull-to-refresh with custom resistance curve
export function useAdvancedPullToRefresh(
  options: UsePullToRefreshOptions & {
    resistanceCurve?: (distance: number) => number
    maxPullDistance?: number
  }
) {
  const { resistanceCurve, maxPullDistance = 200, ...pullToRefreshOptions } = options

  const [elementRef, state] = usePullToRefresh({
    ...pullToRefreshOptions,
    resistance: 1 // We'll handle resistance manually
  })

  // Override the resistance calculation
  const customResistance = useCallback((distance: number) => {
    if (resistanceCurve) {
      return resistanceCurve(distance)
    }
    
    // Default resistance curve: starts easy, gets harder
    const normalizedDistance = distance / maxPullDistance
    return Math.min(1, Math.pow(normalizedDistance, 0.7))
  }, [resistanceCurve, maxPullDistance])

  return [elementRef, state, customResistance]
}
