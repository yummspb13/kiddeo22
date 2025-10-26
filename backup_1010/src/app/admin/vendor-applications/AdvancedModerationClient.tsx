"use client"

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Shield, 
  FileText, 
  User, 
  Building, 
  CreditCard, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  XSquare,
  Flag,
  Eye,
  Edit,
  Save,
  Send
} from 'lucide-react'

interface ModerationAnalysis {
  vendorType: 'START' | 'PRO'
  isVendorPro: boolean
  dataCompleteness: {
    hasBasicInfo: boolean
    hasRoleInfo: boolean
    hasOnboardingData: boolean
    hasProofData: boolean
    hasAgreements: boolean
    completenessScore: number
  }
  dataQuality: {
    hasValidEmail: boolean
    hasValidPhone: boolean
    hasValidWebsite: boolean
    hasValidInn: boolean
    hasValidOrgn: boolean
    qualityScore: number
  }
  documentChecks: {
    hasProofOfRepresentation: boolean
    hasAgreements: boolean
    hasBankDetails: boolean
    hasAddressInfo: boolean
    hasTaxInfo: boolean
    hasCompanyDetails: boolean
    documentScore: number
  }
  userActivity: {
    accountAge: number
    hasRecentLogin: boolean
    hasListingClaims: boolean
    activityScore: number
  }
}

interface Recommendation {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  priority: 'high' | 'medium' | 'low'
}

interface VendorData {
  id: number
  displayName: string
  email: string
  phone: string
  website: string
  kycStatus: string
  proofType: string
  proofData: string
  agreements: string
  user: {
    name: string
    email: string
    createdAt: string
    lastLoginAt: string
  }
  vendorRole: {
    role: string
    fullName: string
    inn: string
    orgnip: string
    orgn: string
    kpp: string
    companyName: string
    directorName: string
    address: string
    legalAddress: string
    bankAccount: string
    bik: string
    bankName: string
    taxRegime: string
  }
}

interface AdvancedModerationClientProps {
  vendorId: number
  onClose: () => void
  onModerationComplete: () => void
}

export default function AdvancedModerationClient({ 
  vendorId, 
  onClose, 
  onModerationComplete 
}: AdvancedModerationClientProps) {
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [moderationAnalysis, setModerationAnalysis] = useState<ModerationAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [moderationHistory, setModerationHistory] = useState([])
  const [listingClaims, setListingClaims] = useState([])
  
  const [moderationNotes, setModerationNotes] = useState('')
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [customChecks, setCustomChecks] = useState<Record<string, boolean>>({})
  const [action, setAction] = useState<'approve' | 'reject' | 'needs_info' | 'hold'>('approve')
  const [submitting, setSubmitting] = useState(false)

  const flags = [
    { id: 'data_incomplete', label: 'Неполные данные', color: 'yellow' },
    { id: 'data_invalid', label: 'Некорректные данные', color: 'red' },
    { id: 'documents_missing', label: 'Отсутствуют документы', color: 'orange' },
    { id: 'suspicious_activity', label: 'Подозрительная активность', color: 'red' },
    { id: 'high_risk', label: 'Высокий риск', color: 'red' },
    { id: 'needs_verification', label: 'Требует верификации', color: 'blue' },
    { id: 'good_quality', label: 'Высокое качество', color: 'green' },
    { id: 'fast_track', label: 'Быстрое одобрение', color: 'green' }
  ]

  const customCheckOptions = [
    { id: 'phone_verified', label: 'Телефон верифицирован' },
    { id: 'email_verified', label: 'Email верифицирован' },
    { id: 'documents_verified', label: 'Документы проверены' },
    { id: 'bank_details_verified', label: 'Банковские реквизиты проверены' },
    { id: 'address_verified', label: 'Адрес проверен' },
    { id: 'tax_info_verified', label: 'Налоговая информация проверена' },
    { id: 'representative_verified', label: 'Представительство подтверждено' },
    { id: 'company_exists', label: 'Компания существует' }
  ]

  useEffect(() => {
    fetchModerationData()
  }, [vendorId])

  const fetchModerationData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching moderation data for vendor:', vendorId)
      
      const url = `/api/admin/vendor-applications/advanced-moderation?vendorId=${vendorId}&key=kidsreview2025`
      console.log('🌐 Fetching URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()

      console.log('📊 Moderation data response:', {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (response.ok) {
        setVendor(data.vendor)
        setModerationAnalysis(data.moderationAnalysis)
        setRecommendations(data.recommendations)
        setOverallScore(data.overallScore)
        setModerationHistory(data.moderationHistory)
        setListingClaims(data.listingClaims)
        console.log('✅ Moderation data loaded successfully')
      } else {
        console.error('❌ Error fetching moderation data:', data.error)
        console.error('❌ Error details:', data.details)
        alert(`Ошибка загрузки данных: ${data.error}\n${data.details || ''}`)
      }
    } catch (error) {
      console.error('❌ Error fetching moderation data:', error)
      alert('Ошибка при загрузке данных модерации')
    } finally {
      setLoading(false)
    }
  }

  const handleFlagToggle = (flagId: string) => {
    setSelectedFlags(prev => 
      prev.includes(flagId) 
        ? prev.filter(id => id !== flagId)
        : [...prev, flagId]
    )
  }

  const handleCustomCheckToggle = (checkId: string) => {
    setCustomChecks(prev => ({
      ...prev,
      [checkId]: !prev[checkId]
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      const response = await fetch('/api/admin/vendor-applications/advanced-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorId,
          action,
          notes: moderationNotes,
          flags: selectedFlags,
          customChecks
        })
      })

      const data = await response.json()

      if (response.ok) {
        onModerationComplete()
        onClose()
      } else {
        console.error('Error submitting moderation:', data.error)
      }
    } catch (error) {
      console.error('Error submitting moderation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Загрузка данных модерации...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor || !moderationAnalysis) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Ошибка загрузки данных</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Расширенная модерация</h2>
            <div className="flex items-center space-x-3">
              <p className="text-gray-600">Вендор: {vendor.displayName}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                moderationAnalysis?.isVendorPro 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              }`}>
                {moderationAnalysis?.vendorType || 'START'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Левая панель - анализ */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            {/* Общий балл */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Общий балл модерации</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(overallScore)} ${getScoreColor(overallScore)}`}>
                  {overallScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    overallScore >= 80 ? 'bg-green-500' : 
                    overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>

            {/* Детальный анализ */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Полнота данных
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Основная информация</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataCompleteness.hasBasicInfo ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Роль вендора</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataCompleteness.hasRoleInfo ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Документы</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataCompleteness.hasProofData ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${getScoreColor(moderationAnalysis.dataCompleteness.completenessScore)}`}>
                      {moderationAnalysis.dataCompleteness.completenessScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Качество данных
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataQuality.hasValidEmail ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Телефон</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataQuality.hasValidPhone ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ИНН</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.dataQuality.hasValidInn ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${getScoreColor(moderationAnalysis.dataQuality.qualityScore)}`}>
                      {moderationAnalysis.dataQuality.qualityScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Документы {moderationAnalysis.isVendorPro ? '(PRO)' : '(START)'}
                </h4>
                <div className="space-y-2">
                  {/* Базовые документы для всех типов */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Подтверждение представительства</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasProofOfRepresentation ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Соглашения</span>
                    <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasAgreements ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  
                  {/* Дополнительные документы для PRO */}
                  {moderationAnalysis.isVendorPro && (
                    <>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <span className="text-xs text-gray-500 font-medium">Дополнительные документы для PRO:</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Банковские реквизиты</span>
                        <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasBankDetails ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Адресная информация</span>
                        <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasAddressInfo ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Налоговые данные</span>
                        <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasTaxInfo ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Данные компании</span>
                        <CheckCircle className={`w-4 h-4 ${moderationAnalysis.documentChecks.hasCompanyDetails ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                    </>
                  )}
                  
                  <div className="text-right">
                    <span className={`text-sm font-bold ${getScoreColor(moderationAnalysis.documentChecks.documentScore)}`}>
                      {moderationAnalysis.documentChecks.documentScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Рекомендации */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Рекомендации</h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start">
                      {rec.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2" />}
                      {rec.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />}
                      {rec.type === 'error' && <XCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2" />}
                      {rec.type === 'info' && <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />}
                      <span className="text-sm">{rec.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая панель - действия модерации */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {/* Действие модерации */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Действие модерации</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAction('approve')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    action === 'approve' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Одобрить</span>
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    action === 'reject' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Отклонить</span>
                </button>
                <button
                  onClick={() => setAction('needs_info')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    action === 'needs_info' 
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Требует информации</span>
                </button>
                <button
                  onClick={() => setAction('hold')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    action === 'hold' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Приостановить</span>
                </button>
              </div>
            </div>

            {/* Флаги */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Флаги</h4>
              <div className="grid grid-cols-2 gap-2">
                {flags.map((flag) => (
                  <button
                    key={flag.id}
                    onClick={() => handleFlagToggle(flag.id)}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      selectedFlags.includes(flag.id)
                        ? `border-${flag.color}-500 bg-${flag.color}-50 text-${flag.color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Flag className="w-4 h-4 mx-auto mb-1" />
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Дополнительные проверки */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Дополнительные проверки</h4>
              <div className="space-y-2">
                {customCheckOptions.map((check) => (
                  <label key={check.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customChecks[check.id] || false}
                      onChange={() => handleCustomCheckToggle(check.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{check.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Заметки модератора */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Заметки модератора</h4>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Введите заметки по модерации..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обработка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Выполнить модерацию
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
