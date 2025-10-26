"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, XCircle, AlertCircle, RotateCcw, FileText, User, Calendar } from "lucide-react"

interface ModerationHistoryItem {
  id: number
  action: string
  previousStatus?: string
  newStatus?: string
  moderatorNotes?: string
  rejectionReason?: string
  documentsCount?: number
  documentsList?: Array<{
    fileName: string
    fileUrl: string
    docType: string
    fileSize?: number
  }>
  ipAddress?: string
  userAgent?: string
  createdAt: string
  moderator?: {
    id: number
    name?: string
    email: string
  }
}

interface ModerationStats {
  actionCounts: Array<{
    action: string
    _count: { action: number }
  }>
  totalSubmissions: number
  totalResubmissions: number
  totalAttempts: number
}

interface VendorModerationHistoryProps {
  vendorId: number
  isOpen: boolean
  onClose: () => void
}

export default function VendorModerationHistory({ vendorId, isOpen, onClose }: VendorModerationHistoryProps) {
  const [history, setHistory] = useState<ModerationHistoryItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchHistory()
    }
  }, [isOpen, vendorId])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vendor-moderation-history?vendorId=${vendorId}`)
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.history)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching moderation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SUBMITTED':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'NEEDS_INFO':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'RESUBMITTED':
        return <RotateCcw className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'SUBMITTED':
        return 'Заявка отправлена'
      case 'APPROVED':
        return 'Заявка одобрена'
      case 'REJECTED':
        return 'Заявка отклонена'
      case 'NEEDS_INFO':
        return 'Требуется дополнительная информация'
      case 'RESUBMITTED':
        return 'Заявка отправлена повторно'
      default:
        return action
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'text-blue-600 bg-blue-50'
      case 'APPROVED':
        return 'text-green-600 bg-green-50'
      case 'REJECTED':
        return 'text-red-600 bg-red-50'
      case 'NEEDS_INFO':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">История модераций</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Загрузка истории...</span>
            </div>
          ) : (
            <>
              {/* Статистика */}
              {stats && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Статистика</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                      <div className="text-sm text-gray-600">Первичных отправок</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.totalResubmissions}</div>
                      <div className="text-sm text-gray-600">Повторных отправок</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalAttempts}</div>
                      <div className="text-sm text-gray-600">Всего попыток</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{history.length}</div>
                      <div className="text-sm text-gray-600">Записей в истории</div>
                    </div>
                  </div>
                </div>
              )}

              {/* История */}
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>История модераций пуста</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getActionIcon(item.action)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getActionText(item.action)}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(item.createdAt).toLocaleString('ru-RU')}</span>
                              {item.moderator && (
                                <>
                                  <User className="w-4 h-4 ml-2" />
                                  <span>{item.moderator.name || item.moderator.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {item.previousStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.previousStatus)}`}>
                              {item.previousStatus}
                            </span>
                          )}
                          {item.newStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.newStatus)}`}>
                              {item.newStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Комментарии */}
                      {(item.moderatorNotes || item.rejectionReason) && (
                        <div className="mb-3">
                          {item.moderatorNotes && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Комментарий модератора:</span>
                              <p className="text-sm text-gray-600 mt-1">{item.moderatorNotes}</p>
                            </div>
                          )}
                          {item.rejectionReason && (
                            <div>
                              <span className="text-sm font-medium text-red-700">Причина отклонения:</span>
                              <p className="text-sm text-red-600 mt-1">{item.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Документы */}
                      {item.documentsList && item.documentsList.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Документы ({item.documentsCount}):
                          </span>
                          <div className="mt-1 space-y-1">
                            {item.documentsList.map((doc, docIndex) => (
                              <div key={docIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>{doc.fileName}</span>
                                <span className="text-xs text-gray-400">({doc.docType})</span>
                                {doc.fileSize && (
                                  <span className="text-xs text-gray-400">
                                    ({Math.round(doc.fileSize / 1024)} KB)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Техническая информация */}
                      <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-3">
                        <div className="flex items-center space-x-4">
                          {item.ipAddress && (
                            <span>IP: {item.ipAddress}</span>
                          )}
                          {item.userAgent && (
                            <span className="truncate max-w-xs">
                              UA: {item.userAgent.substring(0, 50)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
