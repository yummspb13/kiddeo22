"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Building2, User, Calendar } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ListingClaim {
  id: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD'
  proofType: 'DOMAIN_EMAIL' | 'DNS_RECORD' | 'LETTER' | 'PHOTO'
  proofData: string
  submittedAt: string
  reviewedAt?: string
  moderatorNotes?: string
  type?: 'listing' | 'venue'
  listing?: {
    id: number
    title: string
    slug: string
    address?: string
    vendor: {
      id: number
      displayName: string
    }
  }
  venue?: {
    id: number
    name: string
    address?: string
    vendor: {
      id: number
      displayName: string
    }
  }
  requestorVendor: {
    id: number
    displayName: string
    email?: string
    phone?: string
    type: 'START' | 'PRO'
    kycStatus: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'
  }
  moderator?: {
    id: number
    name: string
    email: string
  }
}

export default function ListingClaimsClient() {
  const [claims, setClaims] = useState<ListingClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<ListingClaim | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { addToast } = useToast()
  const [moderatorNotes, setModeratorNotes] = useState('')

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/admin/listing-claims')
      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (claimId: number, action: 'approve' | 'reject' | 'hold') => {
    setActionLoading(claimId)
    try {
      const response = await fetch(`/api/admin/listing-claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          moderatorNotes: moderatorNotes || undefined
        })
      })

      if (response.ok) {
        await fetchClaims()
        setShowDetails(false)
        setSelectedClaim(null)
        setModeratorNotes('')
      } else {
        const errorData = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при обработке заявки',
          message: errorData.error || 'Неизвестная ошибка',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error processing claim:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при обработке заявки',
        message: 'Произошла ошибка при обработке заявки. Попробуйте еще раз.',
        duration: 6000
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'HOLD':
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
      case 'PENDING':
        return 'На рассмотрении'
      case 'HOLD':
        return 'Приостановлено'
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
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'HOLD':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProofTypeText = (type: string) => {
    switch (type) {
      case 'DOMAIN_EMAIL':
        return 'Email на домене'
      case 'DNS_RECORD':
        return 'DNS запись'
      case 'LETTER':
        return 'Письмо-доверенность'
      case 'PHOTO':
        return 'Фото из зала'
      default:
        return type
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Модерация заявок на клайм</h1>
          <p className="text-gray-600 mt-2">Управление заявками на получение прав на карточки</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Заявки на клайм</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {claims.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Заявок на рассмотрение нет
              </div>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {claim.type === 'venue' ? claim.venue?.name : claim.listing?.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-1">{getStatusText(claim.status)}</span>
                        </span>
                        {claim.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {claim.type === 'venue' ? 'Место' : 'Карточка'}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {claim.requestorVendor.displayName}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {claim.requestorVendor.type} • {claim.requestorVendor.kycStatus}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(claim.submittedAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        Способ подтверждения: {getProofTypeText(claim.proofType)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClaim(claim)
                          setShowDetails(true)
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Подробнее
                      </button>

                      {claim.status === 'PENDING' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleAction(claim.id, 'approve')}
                            disabled={actionLoading === claim.id}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </button>
                          <button
                            onClick={() => handleAction(claim.id, 'reject')}
                            disabled={actionLoading === claim.id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
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
        {showDetails && selectedClaim && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Детали заявки на клайм
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedClaim.type === 'venue' ? 'Место' : 'Карточка'}
                  </h4>
                  <p className="text-gray-600">
                    {selectedClaim.type === 'venue' ? selectedClaim.venue?.name : selectedClaim.listing?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedClaim.type === 'venue' ? selectedClaim.venue?.address : selectedClaim.listing?.address}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Заявитель</h4>
                  <p className="text-gray-600">{selectedClaim.requestorVendor.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedClaim.requestorVendor.email} • {selectedClaim.requestorVendor.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    Тип: {selectedClaim.requestorVendor.type} • Статус KYC: {selectedClaim.requestorVendor.kycStatus}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Подтверждение</h4>
                  <p className="text-gray-600">
                    Способ: {getProofTypeText(selectedClaim.proofType)}
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedClaim.proofData}
                    </p>
                  </div>
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
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetails(false)
                    setSelectedClaim(null)
                    setModeratorNotes('')
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Закрыть
                </button>

                {selectedClaim.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction(selectedClaim.id, 'approve')}
                      disabled={actionLoading === selectedClaim.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => handleAction(selectedClaim.id, 'reject')}
                      disabled={actionLoading === selectedClaim.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Отклонить
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
