'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import LikeButton from '@/components/blog/LikeButton'
import FadeInView from '@/components/blog/FadeInView'
import AnimatedCard from '@/components/blog/AnimatedCard'
import BlogComments from '@/components/blog/BlogComments'
import ShareButtons from '@/components/blog/ShareButtons'
import ReadingProgress from '@/components/blog/ReadingProgress'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorTooltip from '@/components/blog/AuthorTooltip'
import RichTextRenderer from '@/components/RichTextRenderer'
import { useUser } from '@/hooks/useUser'
import '@/styles/blog-content.css'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  category?: {
    id: number
    name: string
    slug: string
  }
  author: {
    id: number
    name: string
    image?: string
    email?: string
  }
  city?: {
    id: number
    name: string
    slug: string
  }
  publishedAt: string
  updatedAt: string
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  isFeatured: boolean
}

interface RelatedPost {
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
}

export default function BlogPostPage() {
  const params = useParams()
  const { user, loading: userLoading } = useUser()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article')
      if (article) {
        const scrollTop = window.scrollY
        const docHeight = article.offsetHeight
        const winHeight = window.innerHeight
        const scrollPercent = scrollTop / (docHeight - winHeight)
        setReadingProgress(Math.min(scrollPercent * 100, 100))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${params.slug}`)
      const data = await response.json()
      
      if (response.ok) {
        setPost(data.post)
        setRelatedPosts(data.relatedPosts || [])
      } else {
        console.error('Error fetching post:', data.error)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
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
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Статья не найдена</h1>
          <p className="text-gray-600 mb-6">Возможно, статья была удалена или перемещена</p>
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
      {/* Reading Progress Bar */}
      <ReadingProgress target="article" />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 md:h-[500px] overflow-hidden"
      >
        {post.featuredImage ? (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full h-full"
          >
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
            style={{
              backgroundImage: 'url(/images/blog-bg.jpg)'
            }}
          >
            <span className="text-6xl">📝</span>
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
              className="flex items-center gap-4 mb-4"
            >
              {post.category && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {post.category.name}
                </span>
              )}
              <span className="text-white/80 text-sm">{post.readTime} мин чтения</span>
              <span className="text-white/80 text-sm">•</span>
              <span className="text-white/80 text-sm">{post.viewCount} просмотров</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
            >
              {post.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-white/90 mb-6"
            >
              {post.excerpt}
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Блог', href: '/blog' },
            { label: post.category?.name || 'Статья', href: post.category ? `/blog?category=${post.category.slug}` : undefined },
            { label: post.title }
          ]}
        />
        {/* Author Info */}
        <FadeInView delay={0.2}>
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <span className="text-lg font-medium">
                  {post.author.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <AuthorTooltip authorId={post.author.id}>
                <div className="font-semibold text-gray-900 cursor-pointer hover:text-red-600 transition-colors">
                  {post.author.name}
                </div>
              </AuthorTooltip>
              <div className="text-sm text-gray-600">
                {formatDate(post.publishedAt)}
                {post.updatedAt !== post.publishedAt && (
                  <span className="ml-2">• Обновлено {formatDate(post.updatedAt)}</span>
                )}
              </div>
            </div>
            <div className="ml-auto">
              <LikeButton
                contentId={post.id}
                userId={user?.id ? parseInt(user.id) : undefined}
                initialLikeCount={post.likeCount}
                initialIsLiked={false} // TODO: Get from user session
              />
            </div>
          </div>
        </FadeInView>

        {/* Article Content */}
        <FadeInView delay={0.4}>
          <div 
            className="blog-content"
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '2rem 0',
              lineHeight: '1.7',
              fontSize: '1.125rem',
              color: '#374151'
            }}
          >
            <RichTextRenderer 
              content={post.content}
              className="prose prose-lg max-w-none"
            />
          </div>
        </FadeInView>

        {/* Article Footer */}
        <FadeInView delay={0.6}>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <LikeButton
                  contentId={post.id}
                  userId={user?.id ? parseInt(user.id) : undefined}
                  initialLikeCount={post.likeCount}
                  initialIsLiked={false} // TODO: Get from user session
                />
                <div className="flex items-center gap-2 text-gray-600">
                  <span>💬</span>
                  <span>{post.commentCount || 0} комментариев</span>
                </div>
              </div>
              
              <ShareButtons 
                title={post.title}
                url={`${window.location.origin}/blog/${post.slug}`}
                description={post.excerpt}
              />
            </div>
          </div>
        </FadeInView>

        {/* Comments Section */}
        <FadeInView delay={0.8}>
          <BlogComments 
            contentId={post.id}
            userId={user?.id ? parseInt(user.id) : undefined}
          />
        </FadeInView>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <FadeInView delay={0.8}>
          <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Похожие статьи</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <AnimatedCard
                    key={relatedPost.id}
                    post={relatedPost}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        </FadeInView>
      )}
    </div>
  )
}
