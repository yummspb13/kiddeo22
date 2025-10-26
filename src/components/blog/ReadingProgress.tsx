'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ReadingProgressProps {
  target?: string
}

export default function ReadingProgress({ target = 'article' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector(target)
      if (!element) return

      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementHeight = rect.height
      const elementTop = rect.top

      // Показываем прогресс-бар когда статья входит в viewport
      if (elementTop <= 0 && elementTop + elementHeight > windowHeight) {
        setIsVisible(true)
        
        // Вычисляем прогресс чтения
        const scrolled = Math.abs(elementTop)
        const maxScroll = elementHeight - windowHeight
        const progressPercent = Math.min((scrolled / maxScroll) * 100, 100)
        
        setProgress(progressPercent)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [target])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />
      
      {/* Animated dots */}
      <motion.div
        className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </motion.div>
  )
}









