"use client"

import { CheckCircle, Star, Crown, Shield } from 'lucide-react'

interface PartnerBadgeProps {
  vendorType?: 'START' | 'PRO'
  kycStatus?: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'
  payoutEnabled?: boolean
  officialPartner?: boolean
  subscriptionStatus?: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  className?: string
}

export default function PartnerBadge({
  vendorType,
  kycStatus,
  payoutEnabled,
  officialPartner,
  subscriptionStatus,
  className = ''
}: PartnerBadgeProps) {
  // Определяем тип бейджа на основе статуса вендора
  const getBadgeInfo = () => {
    // Если вендор не зарегистрирован
    if (!vendorType) {
      return null
    }

    // Vendor Pro + approved + payout enabled = Официальный партнер
    if (vendorType === 'PRO' && kycStatus === 'APPROVED' && payoutEnabled) {
      const isPremium = subscriptionStatus === 'ACTIVE'
      return {
        text: isPremium ? 'Премиум партнер' : 'Официальный партнер',
        icon: isPremium ? <Crown className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />,
        bgColor: isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-green-600',
        textColor: 'text-white',
        tooltip: 'Проверен и подключен к выплатам'
      }
    }

    // Vendor Start = Партнер
    if (vendorType === 'START') {
      const isPremium = subscriptionStatus === 'ACTIVE'
      return {
        text: isPremium ? 'Премиум партнер' : 'Партнер',
        icon: isPremium ? <Star className="w-3 h-3" /> : <Shield className="w-3 h-3" />,
        bgColor: isPremium ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'bg-gray-500',
        textColor: 'text-white',
        tooltip: isPremium 
          ? 'Партнер с премиум подпиской' 
          : 'Партнер (базовая регистрация)'
      }
    }

    // Vendor Pro без одобрения = На рассмотрении
    if (vendorType === 'PRO' && kycStatus !== 'APPROVED') {
      return {
        text: 'На рассмотрении',
        icon: <Shield className="w-3 h-3" />,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        tooltip: 'Заявка на верификацию рассматривается'
      }
    }

    return null
  }

  const badgeInfo = getBadgeInfo()

  if (!badgeInfo) {
    return null
  }

  return (
    <div 
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badgeInfo.bgColor} ${badgeInfo.textColor} ${className}`}
      title={badgeInfo.tooltip}
    >
      {badgeInfo.icon}
      <span>{badgeInfo.text}</span>
    </div>
  )
}

// Компонент для отображения статуса верификации
export function VerificationStatus({ kycStatus }: { kycStatus?: string }) {
  const getStatusInfo = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return {
          text: 'Верифицирован',
          color: 'text-green-600',
          icon: <CheckCircle className="w-4 h-4" />
        }
      case 'SUBMITTED':
        return {
          text: 'На рассмотрении',
          color: 'text-yellow-600',
          icon: <Shield className="w-4 h-4" />
        }
      case 'NEEDS_INFO':
        return {
          text: 'Требует документы',
          color: 'text-orange-600',
          icon: <Shield className="w-4 h-4" />
        }
      case 'REJECTED':
        return {
          text: 'Отклонено',
          color: 'text-red-600',
          icon: <Shield className="w-4 h-4" />
        }
      case 'DRAFT':
        return {
          text: 'Черновик',
          color: 'text-gray-600',
          icon: <Shield className="w-4 h-4" />
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  if (!statusInfo) {
    return null
  }

  return (
    <div className={`flex items-center space-x-1 ${statusInfo.color}`}>
      {statusInfo.icon}
      <span className="text-sm">{statusInfo.text}</span>
    </div>
  )
}
