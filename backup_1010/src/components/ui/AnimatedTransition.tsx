"use client"

import { useState, useEffect, ReactNode } from "react"

interface AnimatedTransitionProps {
  children: ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export default function AnimatedTransition({
  children,
  isVisible,
  duration = 300,
  className = ""
}: AnimatedTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration])

  if (!shouldRender) return null

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isAnimating 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-2'
        }
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Компонент для анимированного списка
interface AnimatedListProps {
  items: unknown[]
  renderItem: (item: unknown, index: number) => ReactNode
  keyExtractor: (item: unknown) => string | number
  className?: string
}

export function AnimatedList({ 
  items, 
  renderItem, 
  keyExtractor, 
  className = "" 
}: AnimatedListProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <AnimatedTransition
          key={keyExtractor(item)}
          isVisible={true}
          duration={200}
          className="mb-4"
        >
          {renderItem(item, index)}
        </AnimatedTransition>
      ))}
    </div>
  )
}

// Компонент для анимированной смены контента
interface AnimatedContentProps {
  children: ReactNode
  key: string | number
  className?: string
}

export function AnimatedContent({ 
  children, 
  key, 
  className = "" 
}: AnimatedContentProps) {
  const [currentKey, setCurrentKey] = useState(key)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (key !== currentKey) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setCurrentKey(key)
        setIsTransitioning(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [key, currentKey])

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isTransitioning 
          ? 'opacity-0 transform scale-95' 
          : 'opacity-100 transform scale-100'
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}
