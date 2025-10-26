'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Author {
  id: number
  name: string
  image?: string
  bio?: string
  postCount: number
}

interface AuthorTooltipProps {
  authorId: number
  children: React.ReactNode
}

export default function AuthorTooltip({ authorId, children }: AuthorTooltipProps) {
  const [author, setAuthor] = useState<Author | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAuthor = async () => {
    if (author || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/authors/${authorId}`)
      const data = await response.json()
      
      if (response.ok) {
        setAuthor(data.author)
      }
    } catch (error) {
      console.error('Error fetching author:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseEnter = () => {
    setIsVisible(true)
    fetchAuthor()
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && author && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {author.image ? (
                    <Image
                      src={author.image}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {author.name}
                  </h4>
                  {author.bio && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                      {author.bio}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {author.postCount} {author.postCount === 1 ? 'статья' : author.postCount < 5 ? 'статьи' : 'статей'}
                    </span>
                    <Link
                      href={`/blog/author/${author.id}`}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Профиль →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
