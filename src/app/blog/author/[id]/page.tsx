'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AnimatedCard from '@/components/blog/AnimatedCard'

interface Author {
  id: number
  name: string
  email: string
  image?: string
  bio?: string
  heroImage?: string
  socialLinks?: any
  postCount: number
  createdAt: string
}

interface AuthorPost {
  id: number
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  category?: {
    id: number
    name: string
    slug: string
    color?: string
  }
  publishedAt: string
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
}

export default function AuthorPage() {
  const params = useParams()
  const [author, setAuthor] = useState<Author | null>(null)
  const [posts, setPosts] = useState<AuthorPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAuthor()
    }
  }, [params.id])

  const fetchAuthor = async () => {
    try {
      const response = await fetch(`/api/blog/authors/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setAuthor(data.author)
        setPosts(data.posts)
      } else {
        console.error('Error fetching author:', data.error)
      }
    } catch (error) {
      console.error('Error fetching author:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Автор не найден</h1>
          <p className="text-gray-600 mb-6">Возможно, автор был удален</p>
          <Link 
            href="/blog"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Вернуться к блогу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 md:h-[500px] overflow-hidden"
      >
        {author.heroImage ? (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full h-full"
          >
            <Image
              src={author.heroImage}
              alt={author.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-6 mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                {author.image ? (
                  <Image
                    src={author.image}
                    alt={author.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {author.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{author.name}</h1>
                <p className="text-xl text-white/90">
                  {author.postCount} {author.postCount === 1 ? 'статья' : author.postCount < 5 ? 'статьи' : 'статей'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Author Info */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {author.image ? (
                  <Image
                    src={author.image}
                    alt={author.name}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {author.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{author.name}</h2>
                {author.bio && (
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">{author.bio}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Автор с {formatDate(author.createdAt)}</span>
                  <span>•</span>
                  <span>{author.postCount} публикаций</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Author Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Статьи автора
            </h2>
            <p className="text-gray-600 text-lg">
              Все публикации {author.name}
            </p>
          </motion.div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <AnimatedCard
                  key={post.id}
                  post={{
                    ...post,
                    author: {
                      name: author.name,
                      image: author.image
                    },
                    category: post.category?.name || 'Без категории',
                    isFeatured: false
                  }}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет статей</h3>
              <p className="text-gray-600">Автор еще не опубликовал ни одной статьи</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
