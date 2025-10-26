'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'

interface FadeInViewProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export default function FadeInView({ 
  children, 
  delay = 0, 
  duration = 0.6,
  direction = 'up',
  className = ''
}: FadeInViewProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const directionVariants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  }

  const variants = {
    hidden: {
      opacity: 0,
      ...directionVariants[direction]
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

