'use client'

import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  count?: number
  isFeatured?: boolean
}

export default function SkeletonLoader({ count = 6, isFeatured = false }: SkeletonLoaderProps) {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const SkeletonCard = ({ index, isFeatured = false }: { index: number, isFeatured?: boolean }) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl bg-white shadow-lg ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Image skeleton */}
      <div className="relative h-48 md:h-64 bg-gray-200 overflow-hidden">
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-3/4">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/2">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
          <div className="h-4 bg-gray-200 rounded w-5/6">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
          <div className="h-4 bg-gray-200 rounded w-4/6">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
        </div>

        {/* Meta skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-gray-200 rounded w-8">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </div>
            <div className="h-4 bg-gray-200 rounded w-8">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          index={index} 
          isFeatured={isFeatured && index === 0} 
        />
      ))}
    </div>
  )
}

