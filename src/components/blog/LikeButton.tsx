'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface LikeButtonProps {
  contentId: number
  userId?: number
  initialLikeCount: number
  initialIsLiked?: boolean
  onLike?: (isLiked: boolean) => void
}

export default function LikeButton({ 
  contentId, 
  userId, 
  initialLikeCount, 
  initialIsLiked = false,
  onLike 
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Загружаем актуальное состояние лайков при монтировании
  useEffect(() => {
    if (userId && !isInitialized) {
      fetchLikeStatus()
    }
  }, [userId, contentId, isInitialized])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/blog/likes?contentId=${contentId}&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikeCount(data.likeCount)
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Error fetching like status:', error)
      setIsInitialized(true)
    }
  }

  const handleLike = async () => {
    if (!userId || isLoading) return

    setIsLoading(true)
    const action = isLiked ? 'unlike' : 'like'

    try {
      const response = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          userId,
          action
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newIsLiked = data.isLiked
        setIsLiked(newIsLiked)
        setLikeCount(data.likeCount)
        onLike?.(newIsLiked)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const heartVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.8 },
    liked: { scale: [1, 1.5, 1] }
  }

  const countVariants = {
    rest: { scale: 1 },
    liked: { scale: [1, 1.2, 1] }
  }

  const pulseVariants = {
    rest: { scale: 1, opacity: 0 },
    liked: {
      scale: [1, 2, 3],
      opacity: [0, 0.5, 0]
    }
  }

  return (
    <div className="relative">
      <motion.button
        variants={heartVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        animate={isLiked ? "liked" : "rest"}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        onClick={handleLike}
        disabled={!userId || isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          isLiked
            ? 'bg-red-100 text-red-600 border border-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
        } ${!userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          className="relative"
          animate={isLiked ? "liked" : "rest"}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          <motion.div
            animate={{
              rotate: isLiked ? [0, -10, 10, 0] : 0
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
          >
            <span className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
              {isLiked ? '♥' : '♡'}
            </span>
          </motion.div>

          {/* Pulse effect */}
          {isLiked && (
            <motion.div
              variants={pulseVariants}
              animate="liked"
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full bg-red-200"
            />
          )}
        </motion.div>

        <motion.span
          variants={countVariants}
          animate={isLiked ? "liked" : "rest"}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
          className="font-medium"
        >
          {likeCount}
        </motion.span>
      </motion.button>

      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
          />
        </motion.div>
      )}
    </div>
  )
}

