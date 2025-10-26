'use client'

import { Unbounded } from 'next/font/google';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SkeletonLoader from '@/components/blog/SkeletonLoader';
import CategoryFilter from '@/components/blog/CategoryFilter';
import AuthorTooltip from '@/components/blog/AuthorTooltip';
import { Collection } from '@/types/collections';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

interface BlogPost {
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
  author: {
    id: number
    name: string
    image?: string
  }
  city?: {
    id: number
    name: string
    slug: string
  }
  publishedAt: string
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  isFeatured: boolean
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  postCount: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchCategories()
    fetchCollections()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, searchTerm])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/blog/posts?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        if (page === 1) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        setHasMore(data.pagination.hasNext)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCollections = async () => {
    try {
      const params = new URLSearchParams({
        section: 'blog',
        citySlug: 'moskva' // Москва по умолчанию
      })
      
      const response = await fetch(`/api/collections?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const featuredPost = posts.find(post => post.isFeatured)
  const regularPosts = posts.filter(post => !post.isFeatured)

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/blog-bg.jpg)'
        }}
      >
        {/* Overlay для лучшей читаемости текста */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Блог Kiddeo</h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Полезные статьи, советы и рекомендации для родителей
          </p>
          
          {/* Search в Hero */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 w-full shadow-lg">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по статьям..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none border-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                )}
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Найти
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* Categories Filter */}
        <div className="mb-12">
          <CategoryFilter
            categories={[
              { id: 0, name: 'Все', slug: 'all', postCount: posts.length },
              ...categories
            ]}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Collections Section */}
        {collections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Подборки для вас</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <Link href={`/collections/${collection.slug}`}>
                    <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-6xl">📚</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
                        <p className="text-sm opacity-90 line-clamp-2">{collection.description}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{collection._count?.eventCollections || 0} событий</span>
                        <span>{collection._count?.venueCollections || 0} мест</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
            ))}
          </div>
        </div>
        )}

        {/* Loading State */}
        {loading && posts.length === 0 ? (
          <SkeletonLoader count={6} />
        ) : (
          <>
        {/* Featured Post */}
            {featuredPost && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Рекомендуем к прочтению</h2>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
            <div className="md:flex">
              <div className="md:w-1/2">
                      {featuredPost.featuredImage ? (
                <div
                  className="h-64 md:h-full bg-cover bg-center"
                  style={{
                            backgroundImage: `url("${featuredPost.featuredImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></div>
                      ) : (
                        <div className="h-64 md:h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
                          <span className="text-6xl">📝</span>
                        </div>
                      )}
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-2 mb-4">
                        {featuredPost.category && (
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: featuredPost.category.color + '20',
                              color: featuredPost.category.color || '#6B7280'
                            }}
                          >
                            {featuredPost.category.name}
                  </span>
                        )}
                        <span className="text-gray-500 text-sm">{featuredPost.readTime} мин</span>
                </div>
                      <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                      <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                            {featuredPost.author.image ? (
                              <img
                                src={featuredPost.author.image}
                                alt={featuredPost.author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {featuredPost.author.name.charAt(0)}
                              </span>
                            )}
                    </div>
                    <div>
                            <AuthorTooltip authorId={featuredPost.author.id}>
                              <div className="font-medium cursor-pointer hover:text-red-600 transition-colors">
                                {featuredPost.author.name}
                              </div>
                            </AuthorTooltip>
                            <div className="text-sm text-gray-500">{formatDate(featuredPost.publishedAt)}</div>
                    </div>
                  </div>
                  <Link
                          href={`/blog/${featuredPost.slug}`}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Читать
                  </Link>
                </div>
              </div>
            </div>
                </motion.div>
          </div>
            )}

        {/* Blog Posts Grid */}
            {regularPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform cursor-pointer"
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <div className="relative h-48 overflow-hidden">
                        {post.featuredImage ? (
                          <div
                            className="h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
                style={{
                              backgroundImage: `url("${post.featuredImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
                        ) : (
                          <div className="h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-out">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />
                        
                        {/* Category badge */}
                        <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
                            {post.category?.name || 'Статья'}
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
                </div>
                      
                      <div className="p-6">
                <h3 className="text-lg font-bold mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                            {post.author.image ? (
                              <img
                                src={post.author.image}
                                alt={post.author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                      <span className="text-xs font-medium">
                                {post.author.name.charAt(0)}
                      </span>
                            )}
                    </div>
                    <div>
                            <AuthorTooltip authorId={post.author.id}>
                              <div className="text-sm font-medium cursor-pointer hover:text-red-600 transition-colors">
                                {post.author.name}
                              </div>
                            </AuthorTooltip>
                            <div className="text-xs text-gray-500">{formatDate(post.publishedAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-red-600 text-sm font-medium group-hover:text-red-700 transition-colors">
                    Читать →
                    </div>
                  </div>
                </div>
              </div>
                    </Link>
                  </motion.article>
          ))}
        </div>
            ) : !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Статей не найдено</h3>
                <p className="text-gray-600">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
            )}

        {/* Load More Button */}
            {hasMore && (
        <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </motion.button>
        </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
