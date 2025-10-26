"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Settings, 
  Plus, 
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
  Edit,
  BarChart3
} from 'lucide-react'
import PartnerBadge, { VerificationStatus } from '@/components/PartnerBadge'
import VendorNotifications from '@/components/VendorNotifications'
import VendorResubmitForm from './VendorResubmitForm'
import '@/styles/profile.css'
import '@/styles/vendor-dashboard.css'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface Vendor {
  id: number
  displayName: string
  type: 'START' | 'PRO'
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'
  payoutEnabled: boolean
  officialPartner: boolean
  subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  brandSlug?: string
  supportEmail?: string
  supportPhone?: string
  description?: string
  address?: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  createdAt: string
  updatedAt: string
  city: {
    id: number
    name: string
  }
  vendorRole?: {
    role: 'NPD' | 'IE' | 'LEGAL'
    fullName?: string
    inn?: string
    orgnip?: string
    orgn?: string
    moderatorNotes?: string
    moderatedAt?: string
    moderator?: {
      name?: string
      email: string
    }
  }
  VendorOnboarding?: {
    step: number
    isCompleted: boolean
  }
  venuePartners: Array<{
    id: number
    name: string
    slug: string
    address?: string
    coverImage?: string
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED'
    createdAt: string
    subcategory: {
      name: string
      slug: string
    }
    city: {
      name: string
    }
  }>
  listings: Array<{
    id: number
    title: string
    slug: string
    isActive: boolean
    createdAt: string
  }>
  listingClaims: Array<{
    id: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD'
    submittedAt: string
    listing: {
      id: number
      title: string
      slug: string
    }
  }>
}

interface City {
  id: number
  name: string
  slug: string
}

interface VendorDashboardClientProps {
  vendor: Vendor
  cities: City[]
}

export default function VendorDashboardClient({ vendor, cities }: VendorDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showResubmitForm, setShowResubmitForm] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Обработка якоря в URL для переключения вкладок
  useEffect(() => {
    const hash = window.location.hash.substring(1) // убираем #
    if (hash && ['overview', 'venues', 'listings', 'claims', 'settings'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  const handleUpgradeToPro = async () => {
    try {
      setIsUpgrading(true)
      setUpgradeMessage(null)

      // Сначала проверяем готовность
      const readinessResponse = await fetch('/api/vendor/pro-readiness')
      const readinessData = await readinessResponse.json()

      console.log('🔍 VENDOR DASHBOARD CLIENT: Pro readiness check:', readinessData)
      
      if (!readinessData.isReady) {
        console.log('🔍 VENDOR DASHBOARD CLIENT: Not ready for PRO, redirecting to upgrade')
        // Если не готов, перенаправляем на мастер
        window.location.href = '/vendor/upgrade'
        return
      }

      // Если готов, выполняем переход
      const response = await fetch('/api/vendor/upgrade-to-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Ошибка при переходе на PRO')
      }

      const result = await response.json()
      setUpgradeMessage({ type: 'success', text: result.message })
      
      // Обновляем страницу через 2 секунды, чтобы показать изменения
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Error upgrading to PRO:', error)
      setUpgradeMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Ошибка при переходе на PRO' 
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const getLevelInfo = (type: string, kycStatus: string, payoutEnabled: boolean) => {
    if (type === 'PRO' && kycStatus === 'APPROVED' && payoutEnabled) {
      return {
        name: 'Официальный партнер',
        description: 'Полный доступ к продажам и выплатам',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        gradient: 'from-green-500 to-emerald-600'
      }
    }
    
    if (type === 'START') {
      return {
        name: 'Партнер',
        description: 'Базовая регистрация, создание карточек',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        gradient: 'from-blue-500 to-cyan-600'
      }
    }
    
    if (type === 'PRO' && kycStatus !== 'APPROVED') {
      return {
        name: 'На рассмотрении',
        description: 'Заявка на верификацию рассматривается',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        gradient: 'from-yellow-500 to-orange-600'
      }
    }

    return {
      name: 'Неизвестно',
      description: 'Статус не определен',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      gradient: 'from-gray-500 to-gray-600'
    }
  }

  const levelInfo = getLevelInfo(vendor.type, vendor.kycStatus, vendor.payoutEnabled)
  const LevelIcon = levelInfo.icon

  const getNextSteps = () => {
    const steps = []
    
    if (vendor.type === 'START') {
      steps.push({
        title: 'Перейти на Vendor Pro',
        description: 'Получите доступ к продажам и выплатам',
        action: 'upgrade',
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      })
    }
    
    if (vendor.kycStatus === 'DRAFT') {
      steps.push({
        title: 'Завершить верификацию',
        description: 'Предоставьте документы для проверки',
        action: 'verify',
        icon: FileText,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      })
    }
    
    if (vendor.listings.length === 0) {
      steps.push({
        title: 'Создать первую карточку',
        description: 'Добавьте место или услугу',
        action: 'create',
        icon: Plus,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      })
    }

    return steps
  }

  const nextSteps = getNextSteps()

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Building2 },
    { id: 'venues', name: 'Мои места', icon: Building2 },
    { id: 'listings', name: 'Мои карточки', icon: FileText },
    { id: 'claims', name: 'Заявки на клайм', icon: Shield },
    { id: 'settings', name: 'Настройки', icon: Settings }
  ]

  const renderVenues = () => (
    <div className="space-y-6">
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">Мои места</h2>
            <p className="text-gray-600 font-unbounded-regular">Управляйте своими местами и создавайте карточки</p>
          </div>
          <Link href="/vendor/listings/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            <Plus className="w-5 h-5 inline mr-2" />
            Добавить место
          </Link>
        </div>
        
        {vendor.venuePartners.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-unbounded-bold text-gray-900 mb-3">У вас пока нет мест</h3>
            <p className="text-gray-600 font-unbounded-regular mb-6 max-w-md mx-auto">
              Добавьте свои места, чтобы создавать карточки и привлекать клиентов
            </p>
            <Link href="/vendor/listings/new" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Добавить первое место
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendor.venuePartners.map((venue, index) => (
              <Link
                key={venue.id} 
                href={`/vendor/venues/${venue.id}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {venue.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={venue.coverImage} 
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{venue.name}</h3>
                  <p className="text-sm text-gray-600 font-unbounded-regular mb-2">
                    {venue.subcategory.name} • {venue.city.name}
                  </p>
                  {venue.address && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{venue.address}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold ${
                      venue.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      venue.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      venue.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {venue.status === 'ACTIVE' ? 'Активно' :
                       venue.status === 'PENDING' ? 'На модерации' :
                       venue.status === 'REJECTED' ? 'Отклонено' : 'Неактивно'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Просмотр"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/venue/${venue.slug}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderListings = () => (
    <div className="space-y-6">
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">Мои карточки</h2>
            <p className="text-gray-600 font-unbounded-regular">Управляйте карточками ваших мест</p>
          </div>
          <Link href="/vendor/listings/new" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            <Plus className="w-5 h-5 inline mr-2" />
            Создать карточку
          </Link>
        </div>
        
        {vendor.listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-unbounded-bold text-gray-900 mb-3">У вас пока нет карточек</h3>
            <p className="text-gray-600 font-unbounded-regular mb-6 max-w-md mx-auto">
              Создайте карточки для ваших мест, чтобы привлекать клиентов
            </p>
            <Link href="/vendor/listings/new" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Создать первую карточку
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {vendor.listings.map((listing, index) => (
              <div 
                key={listing.id} 
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{listing.title}</h3>
                    <p className="text-sm text-gray-600 font-unbounded-regular">
                      Создано: {new Date(listing.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-unbounded-bold ${
                      listing.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                    <Link 
                      href={`/vendor/listings/${listing.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Управлять
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderClaims = () => (
    <div className="space-y-6">
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">Заявки на клайм</h2>
            <p className="text-gray-600 font-unbounded-regular">Отслеживайте статус ваших заявок на получение прав</p>
          </div>
        </div>
        
        {vendor.listingClaims.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-unbounded-bold text-gray-900 mb-3">Нет заявок на клайм</h3>
            <p className="text-gray-600 font-unbounded-regular max-w-md mx-auto">
              Здесь будут отображаться ваши заявки на получение прав на места
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendor.listingClaims.map((claim, index) => (
              <div 
                key={claim.id} 
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{claim.listing.title}</h3>
                    <p className="text-sm text-gray-600 font-unbounded-regular">
                      Подано: {new Date(claim.submittedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-unbounded-bold ${
                    claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    claim.status === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {claim.status === 'APPROVED' ? 'Одобрено' :
                     claim.status === 'REJECTED' ? 'Отклонено' :
                     claim.status === 'HOLD' ? 'Приостановлено' : 'На рассмотрении'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="profile-card p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">Настройки вендора</h2>
          <p className="text-gray-600 font-unbounded-regular">Управляйте информацией о вашей компании</p>
        </div>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Название компании
              </label>
              <input
                type="text"
                value={vendor.displayName}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                readOnly
              />
      </div>

            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Email для поддержки
              </label>
              <input
                type="email"
                value={vendor.supportEmail || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                readOnly
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Телефон для поддержки
              </label>
              <input
                type="tel"
                value={vendor.supportPhone || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Веб-сайт
              </label>
              <input
                type="url"
                value={vendor.website || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                readOnly
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
              Описание компании
            </label>
            <textarea
              value={vendor.description || ''}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300 resize-none"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderOverview = () => (
          <div className="space-y-8">
      {/* Статус вендора */}
      <div className="profile-card p-8 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/50 to-blue-100/50 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className={`w-20 h-20 bg-gradient-to-r ${levelInfo.gradient} rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                <LevelIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-unbounded-bold text-gray-900 mb-2">{levelInfo.name}</h2>
                <p className="text-lg text-gray-600 font-unbounded-regular">{levelInfo.description}</p>
              </div>
            </div>
            <PartnerBadge
              vendorType={vendor.type}
              kycStatus={vendor.kycStatus}
              payoutEnabled={vendor.payoutEnabled}
              officialPartner={vendor.officialPartner}
              subscriptionStatus={vendor.subscriptionStatus}
              className="text-lg px-6 py-3 rounded-xl shadow-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-blue-600 transition-colors">{vendor.venuePartners.length}</span>
                  </div>
              <div className="text-sm font-unbounded-medium text-gray-700">Мест добавлено</div>
                  </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-green-600 transition-colors">{vendor.listings.length}</span>
              </div>
              <div className="text-sm font-unbounded-medium text-gray-700">Карточек создано</div>
              </div>

            <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {vendor.listingClaims.filter(c => c.status === 'PENDING').length}
                </span>
                  </div>
              <div className="text-sm font-unbounded-medium text-gray-700">Заявок на рассмотрении</div>
                  </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {vendor.listingClaims.filter(c => c.status === 'APPROVED').length}
                </span>
              </div>
              <div className="text-sm font-unbounded-medium text-gray-700">Одобренных заявок</div>
                  </div>
                  </div>
                </div>
              </div>

      {/* Следующие шаги */}
      {nextSteps.length > 0 && (
        <div className="profile-card p-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-unbounded-bold text-gray-900">Следующие шаги</h3>
          </div>
          <div className="space-y-4">
            {nextSteps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <div 
                  key={index} 
                  className="group flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-12 h-12 ${step.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <StepIcon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-unbounded-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                    <p className="text-sm text-gray-600 font-unbounded-regular">{step.description}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (step.action === 'upgrade') {
                        handleUpgradeToPro()
                      } else if (step.action === 'verify') {
                        window.location.href = '/vendor/onboarding'
                      } else if (step.action === 'create') {
                        window.location.href = '/vendor/listings/new'
                      }
                    }}
                    disabled={isUpgrading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpgrading && step.action === 'upgrade' ? 'Обновление...' :
                     step.action === 'upgrade' ? 'Перейти' : 
                     step.action === 'verify' ? 'Верифицировать' : 'Создать'}
                  </button>
                </div>
              )
            })}
                </div>
              </div>
      )}

      {/* Мои места */}
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-unbounded-bold text-gray-900">Мои места</h3>
          </div>
          <Link href="/vendor/venues" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-unbounded-medium hover:bg-blue-50 rounded-lg transition-colors">
            Посмотреть все →
          </Link>
            </div>

        {vendor.venuePartners.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-unbounded-medium text-gray-500">У вас пока нет мест</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendor.venuePartners.slice(0, 3).map((venue, index) => (
              <div 
                key={venue.id} 
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h4 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{venue.name}</h4>
                <p className="text-sm text-gray-600 font-unbounded-regular mb-3">
                  {venue.subcategory.name} • {venue.city.name}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold ${
                  venue.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {venue.status === 'ACTIVE' ? 'Активно' : 'На модерации'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Последние карточки */}
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-unbounded-bold text-gray-900">Последние карточки</h3>
          </div>
          <Link href="/vendor/listings" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-unbounded-medium hover:bg-blue-50 rounded-lg transition-colors">
            Все карточки →
          </Link>
        </div>

        {vendor.listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-unbounded-medium text-gray-500">У вас пока нет карточек</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendor.listings.slice(0, 3).map((listing, index) => (
              <div 
                key={listing.id} 
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h4 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{listing.title}</h4>
                <p className="text-sm text-gray-600 font-unbounded-regular mb-3">
                  Создано {new Date(listing.createdAt).toLocaleDateString('ru-RU')}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold ${
                  listing.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.isActive ? 'Активна' : 'Неактивна'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Последние заявки на клайм */}
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-unbounded-bold text-gray-900">Заявки на клайм</h3>
          </div>
          <Link href="/vendor/claims" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-unbounded-medium hover:bg-blue-50 rounded-lg transition-colors">
            Все заявки →
          </Link>
        </div>

        {vendor.listingClaims.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-unbounded-medium text-gray-500">У вас нет заявок на клайм</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendor.listingClaims.slice(0, 3).map((claim, index) => (
              <div 
                key={claim.id} 
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h4 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{claim.listing.title}</h4>
                <p className="text-sm text-gray-600 font-unbounded-regular mb-3">
                  Подано {new Date(claim.submittedAt).toLocaleDateString('ru-RU')}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold ${
                  claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {claim.status === 'APPROVED' ? 'Одобрено' :
                   claim.status === 'REJECTED' ? 'Отклонено' :
                   claim.status === 'PENDING' ? 'На рассмотрении' : 'Приостановлено'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-gray-50 ${unbounded.variable}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Заголовок */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-unbounded-bold text-gray-900 mb-2">
                      Панель вендора
                    </h1>
                    <p className="text-lg text-gray-600 font-unbounded-regular">
                      Добро пожаловать, {vendor.displayName}!
                    </p>
                  </div>
                  <VendorNotifications />
                </div>
              </div>

        {/* Сообщения об обновлении */}
        {upgradeMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            upgradeMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {upgradeMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {upgradeMessage.text}
            <button
              onClick={() => setUpgradeMessage(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Статус заявки */}
        {vendor.kycStatus === 'DRAFT' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-unbounded-semibold text-yellow-800 mb-1">
                  Заявка на рассмотрении
                </h3>
                <p className="text-yellow-700 font-unbounded-regular">
                  Ваша заявка на регистрацию вендора отправлена администратору. 
                  Мы рассмотрим её в течение 1-2 рабочих дней и уведомим вас о результате.
                </p>
              </div>
            </div>
          </div>
        )}

        {vendor.kycStatus === 'SUBMITTED' && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-unbounded-semibold text-blue-800 mb-1">
                  Заявка принята
                </h3>
                <p className="text-blue-700 font-unbounded-regular">
                  Ваша заявка принята и находится на рассмотрении. 
                  Ожидайте уведомления о результате проверки.
                </p>
              </div>
            </div>
          </div>
        )}

        {vendor.kycStatus === 'NEEDS_INFO' && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-lg font-unbounded-semibold text-orange-800 mb-1">
                    Требуется дополнительная информация
                  </h3>
                  <p className="text-orange-700 font-unbounded-regular">
                    Администратор запросил дополнительную информацию для проверки вашей заявки. 
                    Пожалуйста, предоставьте запрошенные документы.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResubmitForm(true)}
                className="ml-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Обновить заявку
              </button>
            </div>
          </div>
        )}

        {vendor.kycStatus === 'REJECTED' && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-unbounded-semibold text-red-800 mb-1">
                  Заявка отклонена
                </h3>
                <p className="text-red-700 font-unbounded-regular">
                  К сожалению, ваша заявка была отклонена. 
                  Обратитесь к администратору для получения подробной информации.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Основной контент с боковым меню */}
        <div className="flex gap-8">
          {/* Левое меню */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8 glass animate-slide-in-left">
              {/* Заголовок меню */}
              <div className="mb-6">
                <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2">Панель управления</h3>
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>

              {/* Навигация */}
              <nav className="space-y-2">
                {tabs.map((tab, index) => {
                  const TabIcon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-unbounded-medium transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <TabIcon className={`w-5 h-5 transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <span className="text-sm font-unbounded-medium">{tab.name}</span>
                      {isActive && (
                        <div className="ml-auto flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </nav>
              
              {/* Статус вендора */}
              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-unbounded-medium text-gray-700">Статус:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold ${
                      vendor.type === 'PRO' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                    }`}>
                      {vendor.type === 'PRO' ? 'Pro' : 'Start'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-unbounded-medium text-gray-700">Верификация:</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      vendor.kycStatus === 'APPROVED' ? 'bg-green-100' :
                      vendor.kycStatus === 'SUBMITTED' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <span className={`text-xs font-unbounded-bold ${
                        vendor.kycStatus === 'APPROVED' ? 'text-green-600' :
                        vendor.kycStatus === 'SUBMITTED' ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {vendor.kycStatus === 'APPROVED' ? '✓' : 
                         vendor.kycStatus === 'SUBMITTED' ? '⏳' : '○'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1 min-w-0">
            <div className="profile-container">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'venues' && renderVenues()}
              {activeTab === 'listings' && renderListings()}
              {activeTab === 'claims' && renderClaims()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </div>
        </div>
      </div>

      {/* Форма повторной отправки заявки */}
      {showResubmitForm && (
        <VendorResubmitForm
          vendor={vendor as any}
          cities={cities}
          onClose={() => setShowResubmitForm(false)}
        />
      )}
    </div>
  )
}