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
  File,
  Zap,
  Edit,
  BarChart3,
  FileImage,
  FileSpreadsheet,
  Download,
  Bell,
  GraduationCap,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import EditVendorRoleModal from './components/EditVendorRoleModal'
import EditBankAccountModal from './components/EditBankAccountModal'
import EditTaxProfileModal from './components/EditTaxProfileModal'
import PartnerBadge, { VerificationStatus } from '@/components/PartnerBadge'
import VendorNotifications from '@/components/VendorNotifications'
import VenueAnalytics from '@/components/VenueAnalytics'
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
    companyName?: string
    directorName?: string
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
  
  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Состояние для документов
  const [documents, setDocuments] = useState<{
    vendorRole?: any
    bankAccounts?: any[]
    taxProfiles?: any[]
    documents?: any[]
  }>({})
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  
  // Состояние для модальных окон
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [showTaxModal, setShowTaxModal] = useState(false)
  
  // Состояние для загрузки файлов
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Состояние для настроек вендора
  const [settingsData, setSettingsData] = useState({
    supportEmail: vendor.supportEmail || '',
    supportPhone: vendor.supportPhone || '',
    website: vendor.website || '',
    description: vendor.description || ''
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSuccess, setSettingsSuccess] = useState(false)

  // Загрузка документов
  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch('/api/vendor/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      } else {
        console.error('Failed to load documents')
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  // Загружаем документы при переходе на вкладку
  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments()
    }
  }, [activeTab])

  // Функция загрузки файла
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/vendor/upload-document', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        // Перезагружаем документы после успешной загрузки
        await loadDocuments()
      } else {
        setUploadError(data.error || 'Ошибка при загрузке файла')
      }
    } catch (error) {
      setUploadError('Ошибка при загрузке файла')
    } finally {
      setUploadingFile(false)
    }
  }

  // Функция для обработки изменений в настройках
  const handleSettingsChange = (field: string, value: string) => {
    setSettingsData(prev => ({ ...prev, [field]: value }))
    setSettingsError(null)
    setSettingsSuccess(false)
  }

  // Функция для сохранения настроек
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    setSettingsError(null)
    setSettingsSuccess(false)

    try {
      const response = await fetch('/api/vendor/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      })

      const data = await response.json()

      if (response.ok) {
        setSettingsSuccess(true)
        setTimeout(() => setSettingsSuccess(false), 3000)
      } else {
        setSettingsError(data.error || 'Ошибка при сохранении настроек')
      }
    } catch (error) {
      setSettingsError('Ошибка при сохранении настроек')
    } finally {
      setSavingSettings(false)
    }
  }

  // Функция для получения иконки файла по типу
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="w-5 h-5 text-green-600" />
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-green-700" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  // Функция для получения цвета иконки файла
  const getFileIconColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return 'bg-red-100'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'bg-green-100'
      case 'doc':
      case 'docx':
        return 'bg-blue-100'
      case 'xls':
      case 'xlsx':
        return 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  // Функции для преобразования enum значений в русские названия
  const getTaxRegimeLabel = (regime: string) => {
    const labels: { [key: string]: string } = {
      'OSN': 'Общая система налогообложения (ОСН)',
      'USN': 'Упрощенная система налогообложения (УСН)',
      'PSN': 'Патентная система налогообложения (ПСН)',
      'NPD': 'Самозанятый (НПД)'
    }
    return labels[regime] || regime
  }

  const getVatStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'NONE': 'Нет',
      'VAT_0': 'НДС 0%',
      'VAT_5': 'НДС 5%',
      'VAT_7': 'НДС 7%',
      'VAT_20': 'НДС 20%'
    }
    return labels[status] || status
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'NPD': 'Самозанятый',
      'IE': 'Индивидуальный предприниматель',
      'LEGAL': 'Юридическое лицо'
    }
    return labels[role] || role
  }

  // Функции для сохранения данных
  const handleSaveRole = async (data: any) => {
    const response = await fetch('/api/vendor/documents/role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Ошибка при сохранении роли вендора')
    }
    
    // Перезагружаем документы
    await loadDocuments()
  }

  const handleSaveBankAccount = async (data: any) => {
    const response = await fetch('/api/vendor/documents/bank-account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Ошибка при сохранении банковских реквизитов')
    }
    
    // Перезагружаем документы
    await loadDocuments()
  }

  const handleSaveTaxProfile = async (data: any) => {
    const response = await fetch('/api/vendor/documents/tax-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Ошибка при сохранении налогового профиля')
    }
    
    // Перезагружаем документы
    await loadDocuments()
  }

  // Обработка якоря в URL для переключения вкладок
  useEffect(() => {
    const hash = window.location.hash.substring(1) // убираем #
    if (hash && ['overview', 'venues', 'listings', 'claims', 'documents', 'notifications', 'training', 'knowledge', 'support', 'settings'].includes(hash)) {
      // Проверяем, что таб не отключен
      const tab = tabs.find(t => t.id === hash)
      if (tab && !tab.disabled) {
        setActiveTab(hash)
      }
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
    console.log('🔍 VENDOR DASHBOARD: getLevelInfo called with:', { type, kycStatus, payoutEnabled })
    
    if (type === 'PRO' && kycStatus === 'APPROVED') {
      if (payoutEnabled) {
        return {
          name: 'Официальный партнер',
          description: 'Полный доступ к продажам и выплатам',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          gradient: 'from-green-500 to-emerald-600'
        }
      } else {
        return {
          name: 'Верифицированный партнер',
          description: 'Документы проверены, доступ к расширенным функциям',
          icon: Star,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          gradient: 'from-purple-500 to-violet-600'
        }
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

  const getNextSteps = (): Array<{
    title: string
    description: string
    action: string
    icon: any
    color: string
    bgColor: string
  }> => {
    const steps: Array<{
      title: string
      description: string
      action: string
      icon: any
      color: string
      bgColor: string
    }> = []
    
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
    // Активные пункты (работающие)
    { id: 'overview', name: 'Обзор', icon: Building2 },
    { id: 'venues', name: 'Мои места', icon: Building2 },
    { id: 'claims', name: 'Заявки на клайм', icon: Shield },
    { id: 'documents', name: 'Документы', icon: File },
    { id: 'settings', name: 'Настройки', icon: Settings },
    // Неактивные пункты (Скоро)
    { id: 'listings', name: 'Моя Афиша', icon: FileText, disabled: true, comingSoon: true },
    { id: 'notifications', name: 'Уведомления', icon: Bell, disabled: true, comingSoon: true },
    { id: 'training', name: 'Обучение', icon: GraduationCap, disabled: true, comingSoon: true },
    { id: 'knowledge', name: 'База знаний', icon: BookOpen, disabled: true, comingSoon: true },
    { id: 'support', name: 'Поддержка', icon: HelpCircle, disabled: true, comingSoon: true }
  ]

  const renderVenues = () => (
    <div className="space-y-6">
      <div className="profile-card p-8 vendor-card-mobile md:profile-card">
        <div className="flex items-center justify-between mb-6 vendor-flex-mobile vendor-flex-col-mobile vendor-gap-4-mobile md:flex-row md:gap-0">
          <div>
            <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2 vendor-text-xl-mobile md:text-2xl">Мои места</h2>
            <p className="text-gray-600 font-unbounded-regular vendor-text-sm-mobile md:text-base">Управляйте своими местами и создавайте карточки</p>
          </div>
          <Link href="/vendor/listings/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg vendor-btn-mobile vendor-btn-primary-mobile md:px-6 md:py-3">
            <Plus className="w-5 h-5 inline mr-2 vendor-w-4-mobile vendor-h-4-mobile md:w-5 md:h-5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 vendor-grid-1-mobile md:grid-cols-2 lg:grid-cols-3">
            {vendor.venuePartners.map((venue, index) => (
              <Link
                key={venue.id} 
                href={`/vendor/venues/${venue.id}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer vendor-venue-card-mobile"
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

                <div className="p-6 vendor-p-4-mobile md:p-6">
                  <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors vendor-venue-name-mobile">{venue.name}</h3>
                  <p className="text-sm text-gray-600 font-unbounded-regular mb-2 vendor-text-xs-mobile md:text-sm">
                    {venue.subcategory.name} • {venue.city.name}
                  </p>
                  {venue.address && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 vendor-venue-address-mobile">{venue.address}</p>
                  )}
                  
                  <div className="flex items-center justify-between vendor-venue-actions-mobile">
                    <span className={`px-3 py-1 rounded-full text-xs font-unbounded-bold vendor-status-badge-mobile ${
                      venue.status === 'ACTIVE' ? 'vendor-status-approved-mobile' :
                      venue.status === 'PENDING' ? 'vendor-status-pending-mobile' :
                      venue.status === 'REJECTED' ? 'vendor-status-rejected-mobile' :
                      'vendor-status-draft-mobile'
                    }`}>
                      {venue.status === 'ACTIVE' ? 'Активно' :
                       venue.status === 'PENDING' ? 'На модерации' :
                       venue.status === 'REJECTED' ? 'Отклонено' : 'Неактивно'}
                    </span>
                    <div className="flex items-center space-x-2 vendor-gap-2-mobile">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors vendor-venue-btn-mobile"
                        title="Просмотр"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/venue/${venue.slug}`)
                        }}
                      >
                        <Eye className="w-4 h-4 vendor-w-3-mobile vendor-h-3-mobile md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Аналитика для мест (только для SUPER+) */}
      {vendor.venuePartners.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-unbounded-bold text-gray-900">Аналитика мест</h3>
          {vendor.venuePartners.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-unbounded-bold text-gray-900 mb-4">{venue.name}</h4>
              <VenueAnalytics
                venueId={venue.id}
                onUpgrade={() => {
                  // TODO: Implement upgrade flow
                  console.log('Upgrade to higher tariff for analytics')
                }}
              />
            </div>
          ))}
        </div>
      )}
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
          <Link href="/vendor/listings/new" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 md:mb-0 md:mr-4">
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
            <Link href="/vendor/listings/new" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-unbounded-medium transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 md:mb-0">
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

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="profile-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">Документы</h2>
            <p className="text-gray-600 font-unbounded-regular">Управляйте документами для верификации</p>
          </div>
          {loadingDocuments && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Загрузка...</span>
            </div>
          )}
        </div>
        
        {/* Роль вендора */}
        <div className="mb-8">
          <h3 className="text-lg font-unbounded-bold text-gray-900 mb-4">Роль вендора</h3>
          {documents.vendorRole ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">Тип:</span>
                  <p className="text-gray-900 font-unbounded-medium">
                    {getRoleLabel(documents.vendorRole.role)}
                  </p>
                </div>
                {documents.vendorRole.fullName && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">
                      {documents.vendorRole.role === 'LEGAL' ? 'ФИО ответственного:' : 'ФИО:'}
                    </span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.fullName}</p>
                  </div>
                )}
                {documents.vendorRole.inn && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">ИНН:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.inn}</p>
                  </div>
                )}
                {documents.vendorRole.role === 'IE' && documents.vendorRole.orgnip && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">ОГРНИП:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.orgnip}</p>
                  </div>
                )}
                {documents.vendorRole.role === 'LEGAL' && documents.vendorRole.orgn && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">ОГРН:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.orgn}</p>
                  </div>
                )}
                {documents.vendorRole.companyName && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">Название компании:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.companyName}</p>
                  </div>
                )}
                {documents.vendorRole.directorName && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">Директор:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.vendorRole.directorName}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowRoleModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium transition-colors"
                >
                  Редактировать данные
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2">Данные не заполнены</h3>
              <p className="text-gray-600 font-unbounded-regular mb-4">
                Заполните данные для верификации
              </p>
              <button 
                onClick={() => setShowRoleModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium transition-colors"
              >
                Заполнить данные
              </button>
            </div>
          )}
        </div>

        {/* Банковские реквизиты */}
        <div className="mb-8">
          <h3 className="text-lg font-unbounded-bold text-gray-900 mb-4">Банковские реквизиты</h3>
          {documents.bankAccounts && documents.bankAccounts.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">Банк:</span>
                  <p className="text-gray-900 font-unbounded-medium">{documents.bankAccounts[0].bankName}</p>
                </div>
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">БИК:</span>
                  <p className="text-gray-900 font-unbounded-medium">{documents.bankAccounts[0].bik}</p>
                </div>
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">Расчетный счет:</span>
                  <p className="text-gray-900 font-unbounded-medium">{documents.bankAccounts[0].account}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowBankModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-unbounded-medium transition-colors"
                >
                  Редактировать реквизиты
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2">Реквизиты не указаны</h3>
              <p className="text-gray-600 font-unbounded-regular mb-4">
                Добавьте банковские реквизиты для получения выплат
              </p>
              <button 
                onClick={() => setShowBankModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-unbounded-medium transition-colors"
              >
                Добавить реквизиты
              </button>
            </div>
          )}
        </div>

        {/* Налоговый профиль */}
        <div className="mb-8">
          <h3 className="text-lg font-unbounded-bold text-gray-900 mb-4">Налоговый профиль</h3>
          {documents.taxProfiles && documents.taxProfiles.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">Налоговый режим:</span>
                  <p className="text-gray-900 font-unbounded-medium">{getTaxRegimeLabel(documents.taxProfiles[0].taxRegime)}</p>
                </div>
                <div>
                  <span className="text-sm font-unbounded-medium text-gray-600">Статус НДС:</span>
                  <p className="text-gray-900 font-unbounded-medium">{getVatStatusLabel(documents.taxProfiles[0].vatStatus)}</p>
                </div>
                {documents.taxProfiles[0].taxNumber && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">Налоговый номер:</span>
                    <p className="text-gray-900 font-unbounded-medium">{documents.taxProfiles[0].taxNumber}</p>
                  </div>
                )}
                {documents.taxProfiles[0].registrationDate && (
                  <div>
                    <span className="text-sm font-unbounded-medium text-gray-600">Дата регистрации:</span>
                    <p className="text-gray-900 font-unbounded-medium">
                      {new Date(documents.taxProfiles[0].registrationDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowTaxModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-unbounded-medium transition-colors"
                >
                  Редактировать профиль
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2">Профиль не создан</h3>
              <p className="text-gray-600 font-unbounded-regular mb-4">
                Создайте налоговый профиль для корректного расчета налогов
              </p>
              <button 
                onClick={() => setShowTaxModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-unbounded-medium transition-colors"
              >
                Создать профиль
              </button>
            </div>
          )}
        </div>

        {/* Загруженные документы */}
        <div>
          <h3 className="text-lg font-unbounded-bold text-gray-900 mb-4">Загруженные документы</h3>
          {documents.documents && documents.documents.length > 0 ? (
            <div className="space-y-4">
              {documents.documents.map((doc, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${getFileIconColor(doc.fileName)} rounded-lg flex items-center justify-center`}>
                        {getFileIcon(doc.fileName)}
                      </div>
                      <div>
                        <p className="font-unbounded-medium text-gray-900">{doc.fileName}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{new Date(doc.createdAt).toLocaleDateString('ru-RU')}</span>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="uppercase">{doc.fileName.split('.').pop()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pr-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-unbounded-medium whitespace-nowrap ${
                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                        doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {doc.status === 'APPROVED' ? 'Одобрен' :
                         doc.status === 'PENDING' ? 'На рассмотрении' : 'Отклонен'}
                      </span>
                      <button 
                        onClick={() => window.open(`/api/vendor/documents/${doc.id}/download`, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Скачать документ"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Показываем причину отказа и комментарии модератора */}
                  {doc.status === 'REJECTED' && (doc.rejectionReason || doc.moderatorNotes) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            {doc.rejectionReason && (
                              <div>
                                <p className="text-sm font-unbounded-medium text-red-800">Причина отказа:</p>
                                <p className="text-sm text-red-700">{doc.rejectionReason}</p>
                              </div>
                            )}
                            {doc.moderatorNotes && (
                              <div>
                                <p className="text-sm font-unbounded-medium text-red-800">Комментарий модератора:</p>
                                <p className="text-sm text-red-700">{doc.moderatorNotes}</p>
                              </div>
                            )}
                            {doc.moderatedAt && (
                              <p className="text-xs text-red-600">
                                Отклонен {new Date(doc.moderatedAt).toLocaleDateString('ru-RU')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <input
                  type="file"
                  id="additional-document-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="additional-document-upload"
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-unbounded-medium transition-colors cursor-pointer ${
                    uploadingFile
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {uploadingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Загрузка...
                    </>
                  ) : (
                    'Загрузить еще документы'
                  )}
                </label>
                {uploadError && (
                  <p className="text-red-600 text-sm font-unbounded-regular mt-2">{uploadError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-unbounded-bold text-gray-900 mb-2">Документы не загружены</h3>
              <p className="text-gray-600 font-unbounded-regular mb-4">
                Загрузите документы для верификации
              </p>
              <div className="space-y-4">
                <input
                  type="file"
                  id="document-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="document-upload"
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-unbounded-medium transition-colors cursor-pointer ${
                    uploadingFile
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {uploadingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Загрузка...
                    </>
                  ) : (
                    'Загрузить документы'
                  )}
                </label>
                {uploadError && (
                  <p className="text-red-600 text-sm font-unbounded-regular">{uploadError}</p>
                )}
              </div>
            </div>
          )}
        </div>
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
        
        {/* Сообщения об успехе/ошибке */}
        {settingsSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-unbounded-medium">Настройки успешно сохранены!</span>
          </div>
        )}
        
        {settingsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-unbounded-medium">{settingsError}</span>
          </div>
        )}
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Название компании
              </label>
              <input
                type="text"
                value={vendor.displayName}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Название компании нельзя изменить</p>
            </div>

            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Email для поддержки
              </label>
              <input
                type="email"
                value={settingsData.supportEmail}
                onChange={(e) => handleSettingsChange('supportEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                placeholder="support@example.com"
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
                value={settingsData.supportPhone}
                onChange={(e) => handleSettingsChange('supportPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div>
              <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
                Веб-сайт
              </label>
              <input
                type="url"
                value={settingsData.website}
                onChange={(e) => handleSettingsChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300"
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-unbounded-bold text-gray-700 mb-3">
              Описание компании
            </label>
            <textarea
              value={settingsData.description}
              onChange={(e) => handleSettingsChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-unbounded-regular transition-all duration-300 resize-none"
              placeholder="Расскажите о вашей компании..."
            />
          </div>
          
          {/* Кнопка сохранения */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className={`px-6 py-3 rounded-lg font-unbounded-medium transition-colors flex items-center space-x-2 ${
                savingSettings
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {savingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Сохранить настройки</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOverview = () => (
          <div className="space-y-8">
      {/* Статус вендора */}
      <div className="profile-card p-8 relative overflow-hidden vendor-card-mobile md:profile-card">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/50 to-blue-100/50 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8 vendor-flex-mobile vendor-flex-col-mobile md:flex-row md:space-x-6">
            <div className="flex items-center space-x-6 vendor-flex-mobile vendor-items-center-mobile">
              <div className={`w-20 h-20 bg-gradient-to-r ${levelInfo.gradient} rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 vendor-w-16-mobile vendor-h-16-mobile md:w-20 md:h-20`}>
                <LevelIcon className="w-10 h-10 text-white vendor-w-8-mobile vendor-h-8-mobile md:w-10 md:h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-unbounded-bold text-gray-900 mb-2 vendor-text-2xl-mobile md:text-3xl">{levelInfo.name}</h2>
                <p className="text-lg text-gray-600 font-unbounded-regular vendor-text-base-mobile md:text-lg">{levelInfo.description}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 vendor-grid-2-mobile md:grid-cols-4">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up vendor-stat-card-mobile">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl vendor-p-2-mobile">
                  <Building2 className="w-6 h-6 text-white vendor-w-5-mobile vendor-h-5-mobile md:w-6 md:h-6" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-blue-600 transition-colors vendor-stat-number-mobile">{vendor.venuePartners.length}</span>
                  </div>
              <div className="text-sm font-unbounded-medium text-gray-700 vendor-stat-label-mobile">Мест добавлено</div>
                  </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up vendor-stat-card-mobile" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl vendor-p-2-mobile">
                  <FileText className="w-6 h-6 text-white vendor-w-5-mobile vendor-h-5-mobile md:w-6 md:h-6" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-green-600 transition-colors vendor-stat-number-mobile">{vendor.listings.length}</span>
              </div>
              <div className="text-sm font-unbounded-medium text-gray-700 vendor-stat-label-mobile">Карточек создано</div>
              </div>

            <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up vendor-stat-card-mobile" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500 rounded-xl vendor-p-2-mobile">
                  <Shield className="w-6 h-6 text-white vendor-w-5-mobile vendor-h-5-mobile md:w-6 md:h-6" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-yellow-600 transition-colors vendor-stat-number-mobile">
                  {vendor.listingClaims.filter(c => c.status === 'PENDING').length}
                </span>
                  </div>
              <div className="text-sm font-unbounded-medium text-gray-700 vendor-stat-label-mobile">Заявок на рассмотрении</div>
                  </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up vendor-stat-card-mobile" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl vendor-p-2-mobile">
                  <CheckCircle className="w-6 h-6 text-white vendor-w-5-mobile vendor-h-5-mobile md:w-6 md:h-6" />
                </div>
                <span className="text-3xl font-unbounded-bold text-gray-900 group-hover:text-purple-600 transition-colors vendor-stat-number-mobile">
                  {vendor.listingClaims.filter(c => c.status === 'APPROVED').length}
                </span>
              </div>
              <div className="text-sm font-unbounded-medium text-gray-700 vendor-stat-label-mobile">Одобренных заявок</div>
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
                  className="group flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center space-x-4 flex-1 md:flex-row flex-col text-center md:text-left">
                    <div className={`w-12 h-12 ${step.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto md:mx-0`}>
                      <StepIcon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-unbounded-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                      <p className="text-sm text-gray-600 font-unbounded-regular">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-end">
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
            Все места →
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
              <Link
                key={venue.id}
                href={`/vendor/venues/${venue.id}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 card-hover animate-fade-in-up cursor-pointer"
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
              </Link>
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

        {/* Mobile Header */}
        <div className="vendor-header-mobile block md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="vendor-text-xl-mobile vendor-font-semibold-mobile">Панель вендора</h1>
              <p className="company-name">{vendor.displayName}</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="vendor-hamburger-mobile"
            >
              <div className="vendor-hamburger-line"></div>
              <div className="vendor-hamburger-line"></div>
              <div className="vendor-hamburger-line"></div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="vendor-nav-mobile block md:hidden">
          <ul className="vendor-nav-list-mobile">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`vendor-nav-item-mobile ${isActive ? 'active' : ''}`}
                  >
                    <TabIcon className="vendor-nav-icon" />
                    <span>{tab.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Mobile Drawer */}
        <div className={`vendor-drawer-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="vendor-drawer-header-mobile">
            <h3 className="vendor-drawer-title-mobile">Меню</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="vendor-drawer-close-mobile"
            >
              <span>×</span>
            </button>
          </div>
          <nav className="vendor-drawer-nav-mobile">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`vendor-drawer-item-mobile ${isActive ? 'active' : ''}`}
                >
                  <TabIcon className="vendor-drawer-icon-mobile" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="vendor-overlay-mobile open"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Основной контент с боковым меню */}
        <div className="flex gap-8">
          {/* Левое меню - Desktop only */}
          <div className="w-72 flex-shrink-0 hidden md:block">
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
                  const isDisabled = tab.disabled
                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isDisabled && setActiveTab(tab.id)}
                      disabled={isDisabled}
                      className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-unbounded-medium transition-all duration-300 ${
                        isDisabled 
                          ? 'text-gray-400 cursor-not-allowed opacity-60'
                          : isActive
                            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform hover:scale-[1.02]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md transform hover:scale-[1.02]'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isDisabled
                          ? 'bg-gray-100'
                          : isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <TabIcon className={`w-5 h-5 transition-colors duration-300 ${
                          isDisabled 
                            ? 'text-gray-400'
                            : isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-unbounded-medium whitespace-nowrap">{tab.name}</span>
                        {tab.comingSoon && (
                          <span className="text-[10px] bg-gray-200 text-gray-500 px-1 py-0.5 rounded-full font-unbounded-medium whitespace-nowrap">
                            Скоро
                          </span>
                        )}
                      </div>
                      {isActive && !isDisabled && (
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
            <div className="profile-container vendor-content-mobile md:vendor-content-desktop">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'venues' && renderVenues()}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <div className="profile-card p-8">
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-unbounded-bold text-gray-900 mb-3">Моя Афиша</h3>
                      <p className="text-gray-600 font-unbounded-regular mb-6 max-w-md mx-auto">
                        Функция "Моя Афиша" находится в разработке. Скоро здесь можно будет создавать и управлять карточками событий для ваших мест.
                      </p>
                      <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg font-unbounded-medium">
                        <span className="text-[10px]">Скоро</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'claims' && renderClaims()}
              {activeTab === 'documents' && renderDocuments()}
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

      {/* Модальные окна для редактирования документов */}
      <EditVendorRoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSave={handleSaveRole}
        initialData={documents.vendorRole}
      />

      <EditBankAccountModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSave={handleSaveBankAccount}
        initialData={documents.bankAccounts?.[0]}
      />

      <EditTaxProfileModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        onSave={handleSaveTaxProfile}
        initialData={documents.taxProfiles?.[0]}
      />
    </div>
  )
}