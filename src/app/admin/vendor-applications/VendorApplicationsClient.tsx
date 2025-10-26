"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Building2, User, Calendar, Mail, Phone, MapPin, Settings, BarChart3, FileText, Download, ExternalLink, History } from 'lucide-react'
import AdvancedModerationClient from './AdvancedModerationClient'
import VendorModerationHistory from './VendorModerationHistory'

interface Document {
  id: number
  docType: 'PASSPORT' | 'EGRUL' | 'EGRIP' | 'DIRECTOR_ORDER' | 'NPD_PROOF' | 'BANK_STATEMENT' | 'TAX_CERTIFICATE' | 'OTHER'
  fileUrl: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  issuedAt?: string
  expiresAt?: string
  moderatorNotes?: string
  rejectionReason?: string
  moderatedAt?: string
  moderator?: {
    id: number
    name?: string
    email: string
  }
}

interface VendorApplication {
  id: number
  displayName: string
  type: 'START' | 'PRO'
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'
  description?: string
  phone?: string
  email?: string
  website?: string
  supportEmail?: string
  supportPhone?: string
  createdAt: string
  // Данные для подтверждения представительства
  proofType?: 'DOMAIN_EMAIL' | 'DNS_RECORD' | 'LETTER' | 'PHOTO'
  proofData?: string
  additionalProofData?: string
  agreements?: unknown
  city: {
    id: number
    name: string
  }
  user: {
    id: number
    name?: string
    email: string
  }
  vendorRole?: {
    id: number
    role: 'NPD' | 'IE' | 'LEGAL'
    fullName?: string
    inn?: string
    orgnip?: string
    moderatorNotes?: string
    moderatedBy?: number
    moderatedAt?: string
    moderatorIp?: string
    moderator?: {
      id: number
      name?: string
      email: string
      role: string
    }
  }
  VendorOnboarding?: {
    id: number
    step: number
    isCompleted: boolean
  }
  documents?: Document[]
}

export default function VendorApplicationsClient() {
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [showAdvancedModeration, setShowAdvancedModeration] = useState(false)
  const [documentModeration, setDocumentModeration] = useState<{[key: number]: {status: string, notes: string, rejectionReason: string}}>({})
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [showModerationHistory, setShowModerationHistory] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)

  // Helper to append admin key to API calls in client
  const withKey = (url: string) => {
    try {
      const key = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('key') : null
      if (!key) return url
      return url.includes('?') ? `${url}&key=${encodeURIComponent(key)}` : `${url}?key=${encodeURIComponent(key)}`
    } catch {
      return url
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      console.log('🔍 Fetching vendor applications...')
      const response = await fetch(withKey('/api/admin/vendor-applications'))
      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Applications data:', data)
        setApplications(data.applications)
      } else {
        console.error('🔍 Response status:', response.status)
        console.error('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
        
        let errorData
        try {
          errorData = await response.json()
          console.error('🔍 API Error JSON:', errorData)
        } catch (jsonError) {
          const textData = await response.text()
          console.error('🔍 API Error Text:', textData)
          console.error('🔍 JSON Parse Error:', jsonError)
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (vendorId: number, action: 'approve' | 'reject' | 'needs_info') => {
    setActionLoading(vendorId)
    try {
      const response = await fetch(withKey(`/api/admin/vendor-applications?id=${vendorId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'NEEDS_INFO',
          notes: moderatorNotes || undefined
        })
      })

      if (response.ok) {
        await fetchApplications()
        setShowDetails(false)
        setSelectedApplication(null)
        setModeratorNotes('')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error processing application:', error)
      alert('Ошибка при обработке заявки')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAdvancedModeration = (vendorId: number) => {
    setSelectedVendorId(vendorId)
    setShowAdvancedModeration(true)
  }

  const handleAdvancedModerationComplete = () => {
    // Обновляем список заявок после расширенной модерации
    fetchApplications()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'NEEDS_INFO':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрено'
      case 'REJECTED':
        return 'Отклонено'
      case 'DRAFT':
        return 'Черновик'
      case 'SUBMITTED':
        return 'На рассмотрении'
      case 'NEEDS_INFO':
        return 'Требует информации'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'NEEDS_INFO':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string, vendorRole: any) => {
    // Если нет документов, показываем "Не указано"
    if (!vendorRole?.inn && !vendorRole?.orgnip && !vendorRole?.orgn) {
      return 'Не указано'
    }
    
    switch (role) {
      case 'NPD':
        return 'Самозанятый'
      case 'IE':
        return 'ИП'
      case 'LEGAL':
        return 'Юр. лицо'
      default:
        return 'Не указано'
    }
  }

  const getDocumentTypeText = (docType: string) => {
    switch (docType) {
      case 'PASSPORT':
        return 'Паспорт'
      case 'EGRUL':
        return 'Выписка ЕГРЮЛ'
      case 'EGRIP':
        return 'Выписка ЕГРИП'
      case 'DIRECTOR_ORDER':
        return 'Приказ о назначении директора'
      case 'NPD_PROOF':
        return 'Справка о постановке на учет НПД'
      case 'BANK_STATEMENT':
        return 'Банковская выписка'
      case 'TAX_CERTIFICATE':
        return 'Справка из налоговой'
      case 'OTHER':
        return 'Прочие документы'
      default:
        return docType
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает рассмотрения'
      case 'APPROVED':
        return 'Одобрен'
      case 'REJECTED':
        return 'Отклонен'
      case 'EXPIRED':
        return 'Истек срок действия'
      default:
        return status
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDocumentModeration = async (documentId: number, status: string, notes: string, rejectionReason: string) => {
    try {
      setActionLoading(documentId)
      
      const response = await fetch('/api/admin/documents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          status,
          moderatorNotes: notes,
          rejectionReason: rejectionReason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to moderate document')
      }

      // Если документ отклонен, переводим заявку в статус NEEDS_INFO
      if (status === 'REJECTED' && selectedApplication) {
        const vendorResponse = await fetch(`/api/admin/vendor-applications?id=${selectedApplication.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'NEEDS_INFO',
            notes: `Документ отклонен: ${rejectionReason}`
          })
        })

        if (!vendorResponse.ok) {
          console.error('Ошибка при обновлении статуса заявки')
        }
      }

      // Обновляем локальное состояние
      setDocumentModeration(prev => ({
        ...prev,
        [documentId]: { status, notes, rejectionReason }
      }))

      // Обновляем список заявок
      await fetchApplications()
      
      console.log(`✅ Документ ${documentId} ${status.toLowerCase()}`)
      
      // Показываем уведомление
      if (status === 'REJECTED') {
        alert('Документ отклонен. Заявка переведена в статус "Требуется дополнительная информация"')
      } else {
        alert('Документ одобрен')
      }
    } catch (error) {
      console.error('❌ Ошибка при модерации документа:', error)
      alert('Ошибка при модерации документа')
    } finally {
      setActionLoading(null)
    }
  }

  const getDocumentModerationData = (documentId: number) => {
    return documentModeration[documentId] || { status: '', notes: '', rejectionReason: '' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('🔍 Rendering with applications:', applications.length)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Заявки на регистрацию вендоров</h1>
          <p className="text-gray-600 mt-2">Модерация заявок на регистрацию вендоров</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Заявки вендоров</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Заявок на рассмотрение нет
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {application.displayName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.kycStatus)}`}>
                          {getStatusIcon(application.kycStatus)}
                          <span className="ml-1">{getStatusText(application.kycStatus)}</span>
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.city?.name || 'Город не указан'}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {application.type} • {application.vendorRole ? getRoleText(application.vendorRole.role, application.vendorRole) : 'Не указано'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>

                      {application.description && (
                        <div className="mt-2 text-sm text-gray-500">
                          {application.description}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowDetails(true)
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Подробнее
                      </button>

                      {['SUBMITTED', 'NEEDS_INFO'].includes(application.kycStatus) && (
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => handleAction(application.id, 'approve')}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center px-2 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Одобрить
                          </button>
                          <button
                            onClick={() => handleAction(application.id, 'reject')}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center px-2 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Отклонить
                          </button>
                          <button
                            onClick={() => handleAction(application.id, 'needs_info')}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center px-2 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 disabled:opacity-50"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Запросить данные
                          </button>
                          <button
                            onClick={() => handleAdvancedModeration(application.id)}
                            className="inline-flex items-center px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Расширенная модерация
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Модальное окно с деталями */}
        {showDetails && selectedApplication && (
          <div 
            className="fixed inset-0 bg-white/20 backdrop-blur-sm z-[99999]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDetails(false)
                setSelectedApplication(null)
                setModeratorNotes('')
              }
            }}
          >
            <div 
              className="absolute top-[80px] left-1/2 transform -translate-x-1/2 bg-white rounded-lg max-w-4xl w-full max-h-[calc(100vh-160px)] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Детали заявки вендора
                </h3>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Название компании</h4>
                  <p className="text-gray-600">{selectedApplication.displayName}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Контактная информация</h4>
                  <div className="space-y-1">
                    {selectedApplication.email && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedApplication.email}
                      </p>
                    )}
                    {selectedApplication.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedApplication.phone}
                      </p>
                    )}
                    {selectedApplication.website && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        {selectedApplication.website}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Поддержка</h4>
                  <div className="space-y-1">
                    {selectedApplication.supportEmail && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="font-medium">Email поддержки:</span> {selectedApplication.supportEmail}
                      </p>
                    )}
                    {selectedApplication.supportPhone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="font-medium">Телефон поддержки:</span> {selectedApplication.supportPhone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Местоположение</h4>
                  <p className="text-gray-600">{selectedApplication.city.name}</p>
                </div>

                {selectedApplication.vendorRole && (
                  <div>
                    <h4 className="font-medium text-gray-900">Роль вендора</h4>
                    <p className="text-gray-600">
                      {getRoleText(selectedApplication.vendorRole.role, selectedApplication.vendorRole)}
                      {selectedApplication.vendorRole.fullName && ` • ${selectedApplication.vendorRole.fullName}`}
                    </p>
                    
                    {/* Документы для подтверждения представительства */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-gray-700 mb-2">Документы для подтверждения:</h5>
                      {selectedApplication.proofType && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Способ подтверждения:</span> {
                              selectedApplication.proofType === 'DOMAIN_EMAIL' ? 'Email на домене' :
                              selectedApplication.proofType === 'DNS_RECORD' ? 'DNS запись' :
                              selectedApplication.proofType === 'LETTER' ? 'Письмо-доверенность' :
                              selectedApplication.proofType === 'PHOTO' ? 'Фото из зала' :
                              selectedApplication.proofType
                            }
                          </p>
                          {selectedApplication.proofData && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <p className="text-sm text-gray-700 font-medium">Данные подтверждения:</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedApplication.proofData}</p>
                            </div>
                          )}
                          {selectedApplication.additionalProofData && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <p className="text-sm text-gray-700 font-medium">Дополнительные данные:</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedApplication.additionalProofData}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {!selectedApplication.proofType && (
                        <p className="text-sm text-red-600 font-medium">⚠️ Документы не предоставлены</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedApplication.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">Описание</h4>
                    <p className="text-gray-600">{selectedApplication.description}</p>
                  </div>
                )}

                {/* Документы вендора */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Загруженные документы ({selectedApplication.documents?.length || 0})
                  </h4>
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedApplication.documents.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-gray-900 text-sm truncate">
                                  {getDocumentTypeText(doc.docType)}
                                </h5>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDocumentStatusColor(doc.status)}`}>
                                  {getDocumentStatusText(doc.status)}
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-600 space-y-1">
                                {doc.fileName && (
                                  <p className="truncate"><span className="font-medium">Файл:</span> {doc.fileName}</p>
                                )}
                                {doc.fileSize && (
                                  <p><span className="font-medium">Размер:</span> {formatFileSize(doc.fileSize)}</p>
                                )}
                                {doc.moderatorNotes && (
                                  <p className="text-yellow-700"><span className="font-medium">Комментарий:</span> {doc.moderatorNotes}</p>
                                )}
                                {doc.rejectionReason && (
                                  <p className="text-red-700"><span className="font-medium">Причина отклонения:</span> {doc.rejectionReason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {/* Кнопки просмотра и скачивания */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  console.log('Просмотр документа:', doc.id, doc.fileName)
                                  window.open(`/api/admin/documents/${doc.id}/download?key=kidsreview2025`, '_blank')
                                }}
                                className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors border border-blue-200"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Просмотр
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Скачивание документа:', doc.id, doc.fileName)
                                  const link = document.createElement('a')
                                  link.href = `/api/admin/documents/${doc.id}/download?key=kidsreview2025`
                                  link.download = doc.fileName || 'document'
                                  link.click()
                                }}
                                className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors border border-green-200"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Скачать
                              </button>
                            </div>
                            
                            {/* Кнопки модерации документа */}
                            {doc.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDocumentModeration(doc.id, 'APPROVED', '', '')}
                                  disabled={actionLoading === doc.id}
                                  className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Одобрить
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Укажите причину отклонения документа:')
                                    if (reason) {
                                      handleDocumentModeration(doc.id, 'REJECTED', '', reason)
                                    }
                                  }}
                                  disabled={actionLoading === doc.id}
                                  className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Отказать
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Документы не загружены</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Комментарий модератора</h4>
                  <textarea
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Добавьте комментарий..."
                  />
                </div>

                {/* Информация о модераторе */}
                {selectedApplication.vendorRole?.moderatedAt && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Информация о модерации</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Статус:</span> {getStatusText(selectedApplication.kycStatus)}
                      </p>
                      {selectedApplication.vendorRole.moderator && (
                        <p className="text-blue-800">
                          <span className="font-medium">Модератор:</span> {selectedApplication.vendorRole.moderator.name || 'Не указано'} ({selectedApplication.vendorRole.moderator.email})
                        </p>
                      )}
                      <p className="text-blue-800">
                        <span className="font-medium">Роль модератора:</span> {selectedApplication.vendorRole.moderator?.role || 'Не указано'}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-medium">Дата и время:</span> {new Date(selectedApplication.vendorRole.moderatedAt).toLocaleString('ru-RU')}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-medium">IP адрес:</span> {selectedApplication.vendorRole.moderatorIp || 'Не указан'}
                      </p>
                      {selectedApplication.vendorRole.moderatorNotes && (
                        <p className="text-blue-800">
                          <span className="font-medium">Комментарий:</span> {selectedApplication.vendorRole.moderatorNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedApplication(null)
                      setModeratorNotes('')
                    }}
                    className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Закрыть
                  </button>

                  {['SUBMITTED', 'NEEDS_INFO'].includes(selectedApplication.kycStatus) && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowModerationHistory(true)}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 flex items-center space-x-1"
                      >
                        <History className="w-4 h-4" />
                        <span>История</span>
                      </button>
                      
                      <button
                        onClick={() => handleAction(selectedApplication.id, 'approve')}
                        disabled={actionLoading === selectedApplication.id}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleAction(selectedApplication.id, 'reject')}
                        disabled={actionLoading === selectedApplication.id}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Отклонить
                      </button>
                      <button
                        onClick={() => handleAction(selectedApplication.id, 'needs_info')}
                        disabled={actionLoading === selectedApplication.id}
                        className="px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        Запросить данные
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Расширенная модерация */}
        {showAdvancedModeration && selectedVendorId && (
          <AdvancedModerationClient
            vendorId={selectedVendorId}
            onClose={() => {
              setShowAdvancedModeration(false)
              setSelectedVendorId(null)
            }}
            onModerationComplete={handleAdvancedModerationComplete}
          />
        )}

        {/* История модераций */}
        {showModerationHistory && selectedApplication && (
          <VendorModerationHistory
            vendorId={selectedApplication.id}
            isOpen={showModerationHistory}
            onClose={() => setShowModerationHistory(false)}
          />
        )}
      </div>
    </div>
  )
}
