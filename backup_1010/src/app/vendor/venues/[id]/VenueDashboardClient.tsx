"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Building2, 
  Settings, 
  Edit,
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Shield,
  Crown,
  Zap,
  MapPin,
  Camera,
  MessageSquare,
  BarChart3,
  Heart,
  Share2,
  Phone,
  Mail,
  Globe,
  Lock,
  ChevronRight,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  Target,
  MessageCircle,
  Newspaper,
  Baby,
  DollarSign,
  Plus,
  X
} from 'lucide-react'
import { Unbounded } from 'next/font/google'
import '@/styles/venue-dashboard.css'
import EditVenueForm from './EditVenueForm'
import FeaturesManager from './FeaturesManager'
import QAManager from './QAManager'
import NewsManager from './NewsManager'
import { useRouter } from 'next/navigation'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface Venue {
  id: number
  name: string
  address: string
  description: string
  coverImage: string | null
  additionalImages: string[]
  status: string
  createdAt: string
  district: string | null
  metro: string | null
  lat: number | null
  lng: number | null
  tariff: string
  priceFrom?: number | null
  ageFrom?: number | null
  subcategory: {
    name: string
    slug: string
    category: {
      name: string
    }
  }
  city: {
    name: string
    slug: string
  }
}

interface VenueDashboardClientProps {
  venue: Venue
  currentTariff: 'FREE' | 'SUPER' | 'MAXIMUM'
}

type TariffPlan = 'FREE' | 'SUPER' | 'MAXIMUM'

export default function VenueDashboardClient({ venue: initialVenue, currentTariff }: VenueDashboardClientProps) {
  const router = useRouter()
  const [venue, setVenue] = useState(initialVenue)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reviews, setReviews] = useState([])
  const [unreadReviewsCount, setUnreadReviewsCount] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const isFeatureAvailable = (requiredTariff: TariffPlan) => {
    const tariffLevels = { FREE: 0, SUPER: 1, MAXIMUM: 2 }
    return tariffLevels[currentTariff] >= tariffLevels[requiredTariff]
  }

  const getTariffName = (tariff: TariffPlan) => {
    const names = { FREE: 'Бесплатный', SUPER: 'Супер', MAXIMUM: 'Максимум' }
    return names[tariff]
  }

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const response = await fetch(`/api/vendor/venues/${venue.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setUnreadReviewsCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const markReviewAsRead = async (reviewId: string) => {
    try {
      await fetch(`/api/vendor/venues/${venue.id}/reviews/${reviewId}/read`, {
        method: 'POST'
      })
      // Обновляем счетчик непрочитанных
      setUnreadReviewsCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking review as read:', error)
    }
  }

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyMessage.trim()) return

    console.log('🔍 VENDOR: Starting reply submission for review:', reviewId)
    setSubmittingReply(true)
    
    try {
      console.log('🔍 VENDOR: Sending request to API...')
      
      // Добавляем таймаут для предотвращения зависания
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд
      
      const response = await fetch('/api/venue-review-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          message: replyMessage.trim()
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      console.log('🔍 VENDOR: Response status:', response.status)
      console.log('🔍 VENDOR: Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 VENDOR: Reply created successfully:', data)
        
        setReplyMessage('')
        setReplyingTo(null)
        
        console.log('🔍 VENDOR: Refreshing reviews...')
        await fetchReviews() // Перезагружаем отзывы
        
        setUnreadReviewsCount(prev => Math.max(0, prev - 1)) // Уменьшаем счетчик
        console.log('🔍 VENDOR: Reply submission completed successfully')
      } else {
        const errorData = await response.json()
        console.error('🔍 VENDOR: Error submitting reply:', errorData)
        alert('Ошибка при отправке ответа: ' + (errorData.error || 'Неизвестная ошибка'))
      }
    } catch (error) {
      console.error('🔍 VENDOR: Network error submitting reply:', error)
      if (error.name === 'AbortError') {
        alert('Время ожидания истекло. Попробуйте еще раз.')
      } else {
        alert('Ошибка сети при отправке ответа: ' + error.message)
      }
    } finally {
      setSubmittingReply(false)
      console.log('🔍 VENDOR: Reply submission finished')
    }
  }

  // Загружаем отзывы при смене на вкладку отзывов
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews()
    }
  }, [activeTab])

  const handleEdit = () => {
    setIsEditing(true)
    setActiveTab('edit')
  }

  const handleSave = async (formData: any) => {
    setSaving(true)
    try {
      console.log('Saving venue data:', formData)
      
      // Обновляем данные места с обновленным списком изображений
      setVenue(prevVenue => ({
        ...prevVenue,
        additionalImages: formData.additionalImages || prevVenue.additionalImages,
        name: formData.name || prevVenue.name,
        description: formData.description || prevVenue.description,
        address: formData.address || prevVenue.address,
        district: formData.district || prevVenue.district,
        metro: formData.metro || prevVenue.metro,
        priceFrom: typeof formData.priceFrom === 'number' ? formData.priceFrom : (formData.priceFrom ? parseInt(formData.priceFrom) : prevVenue.priceFrom),
        ageFrom: typeof formData.ageFrom === 'number' ? formData.ageFrom : (formData.ageFrom ? parseInt(formData.ageFrom) : prevVenue.ageFrom),
        lat: formData.coordinates ? parseFloat(formData.coordinates.split(',')[0]) : prevVenue.lat,
        lng: formData.coordinates ? parseFloat(formData.coordinates.split(',')[1]) : prevVenue.lng
      }))
      
      // После успешного сохранения
      setIsEditing(false)
      setActiveTab('overview')
      
      console.log('Venue data updated in dashboard')
    } catch (error) {
      console.error('Error saving venue:', error)
      alert('Ошибка при сохранении места')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setActiveTab('overview')
  }

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Eye },
    { id: 'edit', name: 'Редактирование', icon: Edit },
    { id: 'analytics', name: 'Аналитика', icon: BarChart3, requiredTariff: 'SUPER' as TariffPlan },
    { id: 'reviews', name: 'Отзывы', icon: Star },
    { id: 'qa', name: 'Вопросы/Ответы', icon: MessageSquare, requiredTariff: 'SUPER' as TariffPlan },
    { id: 'chat', name: 'Чат с клиентами', icon: MessageCircle, requiredTariff: 'SUPER' as TariffPlan, comingSoon: true },
    { id: 'features', name: 'Особенности', icon: Shield, requiredTariff: 'SUPER' as TariffPlan },
    { id: 'news', name: 'Новости', icon: Newspaper, requiredTariff: 'SUPER' as TariffPlan },
    { id: 'products', name: 'Товары/Услуги', icon: ShoppingBag, requiredTariff: 'MAXIMUM' as TariffPlan },
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-unbounded ${unbounded.variable}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <Link
                href="/vendor/dashboard#venues"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Назад к местам
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 gradient-text-primary">{venue.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {venue.subcategory.category.name} • {venue.city.name}
                </p>
              </div>
            </div>
            
            {/* Tariff Badge */}
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <div className={`tariff-badge px-4 py-2 rounded-full text-sm font-bold ${
                currentTariff === 'FREE' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700' :
                currentTariff === 'SUPER' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700' :
                'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
              }`}>
                {getTariffName(currentTariff)}
              </div>
              <button className="btn-dynamic px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300">
                Улучшить тариф
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-3">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isAvailable = isFeatureAvailable(tab.requiredTariff || 'FREE')
                const isComingSoon = tab.comingSoon
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'edit') {
                        handleEdit()
                      } else {
                        setActiveTab(tab.id)
                      }
                    }}
                    disabled={!isAvailable || isComingSoon}
                    className={`nav-tab w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'active bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 shadow-lg'
                        : isAvailable && !isComingSoon
                        ? 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200 hover:border-blue-200'
                        : 'bg-gray-100/50 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                      <span className="font-bold">{tab.name}</span>
                      {tab.id === 'reviews' && unreadReviewsCount > 0 && (
                        <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadReviewsCount}
                        </div>
                      )}
                    </div>
                    {!isAvailable && tab.requiredTariff && (
                      <div className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {getTariffName(tab.requiredTariff)}
                      </div>
                    )}
                    {isComingSoon && (
                      <div className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full animate-pulse">
                        Скоро
                      </div>
                    )}
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 animate-bounce" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Venue Info Card */}
                <div className="card-dynamic bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-start space-x-8">
                    {venue.coverImage ? (
                      <div className="relative group w-80">
                        <img
                          src={venue.coverImage}
                          alt={venue.name}
                          className="w-80 h-60 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                          style={{ aspectRatio: '800/600' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="w-80 h-60 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center animate-pulse" style={{ aspectRatio: '800/600' }}>
                        <Building2 className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 gradient-text-primary">{venue.name}</h2>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                          <MapPin className="w-4 h-4 mr-3 text-blue-500" />
                          {venue.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                          <Clock className="w-4 h-4 mr-3 text-green-500" />
                          Создано {new Date(venue.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <button 
                        onClick={handleEdit}
                        className="btn-dynamic px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300"
                      >
                        <Edit className="w-5 h-5 mr-2 inline" />
                        Редактировать
                      </button>
                      <button className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105">
                        <Eye className="w-5 h-5 mr-2 inline" />
                        Просмотр
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="stats-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200 p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl animate-pulse">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-600">Просмотры</p>
                        <p className="text-3xl font-bold text-gray-900 gradient-text-primary">1,234</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stats-card bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200 p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl animate-pulse">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-600">Рейтинг</p>
                        <p className="text-3xl font-bold text-gray-900 gradient-text-success">4.8</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stats-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border border-purple-200 p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl animate-pulse">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-600">Отзывы</p>
                        <p className="text-3xl font-bold text-gray-900 gradient-text">42</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Free Tier Features */}
                <div className="card-dynamic bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border border-green-200 p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 gradient-text-success">✅ Доступные функции</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">4 фото</span>
                    </div>
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">Описание</span>
                    </div>
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">Адрес + координаты</span>
                    </div>
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">Отзывы</span>
                    </div>
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">Район</span>
                    </div>
                    <div className="feature-card flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-900">Метро</span>
                    </div>
                  </div>
                </div>

                {/* Premium Features Preview */}
                <div className="card-dynamic bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl border border-blue-200 p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 gradient-text">🚀 Премиум функции</h3>
                    <button className="btn-dynamic px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 animate-pulse">
                      Улучшить тариф
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                      <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-600">10 фото (Супер)</span>
                    </div>
                    <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                      <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-600">Аналитика (Супер)</span>
                    </div>
                    <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                      <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-600">20 фото (Максимум)</span>
                    </div>
                    <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                      <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                      <span className="text-sm font-bold text-gray-600">Видео (Максимум)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="animate-fade-in-up">
                {isEditing ? (
                  <EditVenueForm
                    venue={venue}
                    currentTariff={currentTariff}
                    onSave={handleSave}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <div className="card-dynamic bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="text-center py-12">
                      <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Редактирование места</h3>
                      <p className="text-gray-600 mb-6">
                        Нажмите кнопку "Редактировать" в карточке места выше, чтобы начать редактирование
                      </p>
                      <button
                        onClick={handleEdit}
                        className="btn-dynamic px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300"
                      >
                        <Edit className="w-5 h-5 mr-2 inline" />
                        Начать редактирование
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Аналитика</h2>
                {!isFeatureAvailable('SUPER') ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Аналитика недоступна</h3>
                    <p className="text-gray-600 mb-4">Эта функция доступна только в тарифе "Супер"</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Улучшить тариф
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">Аналитика будет здесь...</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Отзывы</h2>
                  {unreadReviewsCount > 0 && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                      {unreadReviewsCount} новых отзывов
                    </div>
                  )}
                </div>
                
                {loadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Загрузка отзывов...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Пока нет отзывов</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {review.user.name?.charAt(0) || 'А'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{review.user.name || 'Аноним'}</h4>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!review.isRead && (
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                              ✨ Новый
                            </div>
                          )}
                        </div>
                        
                        {review.comment && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-gray-700 text-base leading-relaxed">{review.comment}</p>
                          </div>
                        )}
                        
                        {review.photos && JSON.parse(review.photos).length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {JSON.parse(review.photos).map((photo: string, index: number) => (
                              <div key={index} className="relative group">
                                <img
                                  src={photo}
                                  alt={`Review photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-xl border border-gray-200 shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-105"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Существующие ответы */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-6 space-y-3">
                            <h5 className="text-sm font-bold text-gray-600 mb-3">Ответы вендора:</h5>
                            {review.replies.map((reply: any) => (
                              <div key={reply.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {reply.user.name?.charAt(0) || 'А'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-blue-900 text-sm">
                                      {reply.user.name || 'Администратор'}
                                    </span>
                                    <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-1 rounded-full">
                                      {new Date(reply.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-blue-800 text-sm leading-relaxed">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => markReviewAsRead(review.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 ${
                                review.isRead 
                                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {review.isRead ? '✅ Прочитано' : '📖 Отметить'}
                            </button>
                            
                            {replyingTo === review.id ? (
                              <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                                <div className="mb-3">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Ответ на отзыв
                                  </label>
                                  <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Напишите ответ на отзыв..."
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    rows={4}
                                  />
                                </div>
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleReplySubmit(review.id)}
                                    disabled={submittingReply || !replyMessage.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                                  >
                                    {submittingReply ? 'Отправка...' : 'Отправить ответ'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyMessage('')
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingTo(review.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                              >
                                ✉️ Ответить
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full">
                              <span className="text-sm text-gray-600 font-bold">
                                {review.likesCount} 👍
                              </span>
                              <span className="text-sm text-gray-600 font-bold">
                                {review.dislikesCount} 👎
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Вопросы и ответы</h2>
                {!isFeatureAvailable('SUPER') ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Вопросы/Ответы недоступны</h3>
                    <p className="text-gray-600 mb-4">Эта функция доступна только в тарифе "Супер"</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Улучшить тариф
                    </button>
                  </div>
                ) : (
                  <QAManager venueId={venue.id} />
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Чат с клиентами</h2>
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Скоро</h3>
                  <p className="text-gray-600 mb-4">Эта функция находится в разработке</p>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Особенности места</h2>
                {!isFeatureAvailable('SUPER') ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Особенности недоступны</h3>
                    <p className="text-gray-600 mb-4">Эта функция доступна только в тарифе "Супер"</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Улучшить тариф
                    </button>
                  </div>
                ) : (
                  <FeaturesManager venueId={venue.id} />
                )}
              </div>
            )}

            {activeTab === 'news' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Новости</h2>
                {!isFeatureAvailable('SUPER') ? (
                  <div className="text-center py-12">
                    <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Новости недоступны</h3>
                    <p className="text-gray-600 mb-4">Эта функция доступна только в тарифе "Супер"</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Улучшить тариф
                    </button>
                  </div>
                ) : (
                  <NewsManager venueId={venue.id} />
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Товары и услуги</h2>
                {!isFeatureAvailable('MAXIMUM') ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Товары/Услуги недоступны</h3>
                    <p className="text-gray-600 mb-4">Эта функция доступна только в тарифе "Максимум"</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Улучшить тариф
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">Товары и услуги будут здесь...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
