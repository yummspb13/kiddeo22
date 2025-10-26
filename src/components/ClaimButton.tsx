"use client"

import { useState } from 'react'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import { Building2, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ClaimButtonProps {
  listingId: number
  listingTitle: string
  isClaimable: boolean
  claimStatus?: string
  venueId?: number
  venueName?: string
  onClaimSuccess?: () => void
}

export default function ClaimButton({ 
  listingId, 
  listingTitle, 
  isClaimable, 
  claimStatus,
  venueId,
  venueName,
  onClaimSuccess 
}: ClaimButtonProps) {
  const { user } = useAuthBridge()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    proofType: 'DOMAIN_EMAIL',
    proofData: ''
  })

  const handleClaim = async () => {
    if (!user?.id) {
      // Перенаправляем на страницу входа
      window.location.href = '/auth/signin'
      return
    }

    setShowModal(true)
  }

  const handleSubmitClaim = async () => {
    if (!formData.proofData.trim()) {
      addToast({
        type: 'warning',
        title: 'Заполните данные',
        message: 'Пожалуйста, заполните данные для подтверждения',
        duration: 5000
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/listings/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId,
          proofType: formData.proofType,
          proofData: formData.proofData
        })
      })

      if (response.ok) {
        const data = await response.json()
        addToast({
          type: 'success',
          title: 'Заявка отправлена!',
          message: 'Заявка на клайм отправлена! Мы рассмотрим её в ближайшее время.',
          duration: 6000
        })
        setShowModal(false)
        onClaimSuccess?.()
      } else {
        const errorData = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при отправке заявки',
          message: errorData.error || 'Неизвестная ошибка',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error submitting claim:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при отправке заявки',
        message: 'Произошла ошибка при отправке заявки. Попробуйте еще раз.',
        duration: 6000
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (claimStatus) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'PENDING':
        return <Shield className="w-4 h-4 text-yellow-600" />
      case 'HOLD':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (claimStatus) {
      case 'APPROVED':
        return 'Одобрено'
      case 'REJECTED':
        return 'Отклонено'
      case 'PENDING':
        return 'На рассмотрении'
      case 'HOLD':
        return 'Приостановлено'
      default:
        return null
    }
  }

  if (!isClaimable) {
    return null
  }

  return (
    <>
      <button
        onClick={handleClaim}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Building2 className="w-4 h-4" />
        <span>Это моя компания</span>
        {getStatusIcon()}
      </button>

      {claimStatus && (
        <div className="mt-2 text-sm text-gray-600">
          Статус: {getStatusText()}
        </div>
      )}

      {/* Модальное окно для подачи заявки */}
      {showModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Заявка на получение прав
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Вы подаете заявку на получение прав на карточку: <strong>{listingTitle}</strong>
              {venueName && (
                <span className="block mt-1">
                  Место: <strong>{venueName}</strong>
                </span>
              )}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Способ подтверждения
                </label>
                <select
                  value={formData.proofType}
                  onChange={(e) => setFormData(prev => ({ ...prev, proofType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DOMAIN_EMAIL">Email на домене компании</option>
                  <option value="DNS_RECORD">DNS запись</option>
                  <option value="LETTER">Письмо-доверенность</option>
                  <option value="PHOTO">Фото из зала/офиса</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Данные для подтверждения *
                </label>
                <textarea
                  value={formData.proofData}
                  onChange={(e) => setFormData(prev => ({ ...prev, proofData: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опишите способ подтверждения или приложите ссылку на документ"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={loading || !formData.proofData.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Подать заявку'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
