'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import LikeButton from '@/components/blog/LikeButton'
import { useUser } from '@/hooks/useUser'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  category: string
  author: {
    name: string
    image?: string
  }
  publishedAt: string
  readTime: number
  likeCount: number
  commentCount: number
  isFeatured?: boolean
}

interface AnimatedCardProps {
  post: BlogPost
  index: number
  isFeatured?: boolean
}

export default function AnimatedCard({ post, index, isFeatured = false }: AnimatedCardProps) {
  const { user } = useUser()
  const [isHovered, setIsHovered] = useState(false)

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform cursor-pointer ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        {/* Image Container */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          {post.featuredImage ? (
            <motion.div
              variants={imageVariants}
              className="relative w-full h-full"
            >
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
              {post.category}
            </span>
          </div>

          {/* Read time badge */}
          <div className="absolute top-4 right-4 group-hover:scale-105 transition-transform duration-300">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg font-unbounded">
              {post.readTime} мин
            </span>
          </div>

          {/* Hover overlay with action */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

          {/* Featured Badge */}
          {post.isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                ⭐ Рекомендуем
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {post.title}
          </motion.h3>
          
          <motion.p 
            className="text-gray-600 text-sm mb-4 line-clamp-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {post.excerpt}
          </motion.p>

          {/* Meta Info */}
          <motion.div 
            className="flex items-center justify-between text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  {post.author.image ? (
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {post.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span>{post.author.name}</span>
              </div>
              <span>•</span>
              <span>{post.readTime} мин</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <LikeButton
                contentId={post.id}
                userId={user?.id ? parseInt(user.id) : undefined}
                initialLikeCount={post.likeCount}
                initialIsLiked={false}
              />
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>{post.commentCount}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </Link>
    </motion.div>
  )
}

