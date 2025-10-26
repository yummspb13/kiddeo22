"use client"

import { useState, useEffect } from 'react'
import { FileText, Download, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter, Eye } from 'lucide-react'

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
  vendor: {
    id: number
    displayName: string
    type: 'START' | 'PRO'
    kycStatus: string
    user: {
      id: number
      name?: string
      email: string
    }
  }
}

interface DocumentsClientProps {
  searchParams: unknown
}

export default function DocumentsClient({ searchParams }: DocumentsClientProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    docType: '',
    search: ''
  })

  useEffect(() => {
    fetchDocuments()
  }, [filters])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.docType) params.append('docType', filters.docType)
      if (filters.search) params.append('search', filters.search)
      
      const response = await fetch(`/api/admin/documents?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch documents')
      
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (documentId: number, status: string) => {
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
          moderatorNotes: moderatorNotes,
          rejectionReason: status === 'REJECTED' ? rejectionReason : ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to moderate document')
      }

      await fetchDocuments()
      setShowDetails(false)
      setSelectedDocument(null)
      setModeratorNotes('')
      setRejectionReason('')
      
      console.log(`✅ Документ ${documentId} ${status.toLowerCase()}`)
    } catch (error) {
      console.error('❌ Ошибка при модерации документа:', error)
      alert('Ошибка при модерации документа')
    } finally {
      setActionLoading(null)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок и фильтры */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Управление документами</h1>
          
          {/* Фильтры */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Поиск по названию файла..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все статусы</option>
                  <option value="PENDING">Ожидает рассмотрения</option>
                  <option value="APPROVED">Одобрен</option>
                  <option value="REJECTED">Отклонен</option>
                  <option value="EXPIRED">Истек срок действия</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа</label>
                <select
                  value={filters.docType}
                  onChange={(e) => setFilters(prev => ({ ...prev, docType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все типы</option>
                  <option value="PASSPORT">Паспорт</option>
                  <option value="EGRUL">Выписка ЕГРЮЛ</option>
                  <option value="EGRIP">Выписка ЕГРИП</option>
                  <option value="DIRECTOR_ORDER">Приказ о назначении директора</option>
                  <option value="NPD_PROOF">Справка о постановке на учет НПД</option>
                  <option value="BANK_STATEMENT">Банковская выписка</option>
                  <option value="TAX_CERTIFICATE">Справка из налоговой</option>
                  <option value="OTHER">Прочие документы</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: '', docType: '', search: '' })}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Список документов */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Документы не найдены</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getDocumentTypeText(doc.docType)}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDocumentStatusColor(doc.status)}`}>
                          {getDocumentStatusText(doc.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Вендор:</span> {doc.vendor.displayName} ({doc.vendor.user.email})</p>
                        <p><span className="font-medium">Тип вендора:</span> {doc.vendor.type}</p>
                        {doc.fileName && (
                          <p><span className="font-medium">Файл:</span> {doc.fileName}</p>
                        )}
                        {doc.fileSize && (
                          <p><span className="font-medium">Размер:</span> {formatFileSize(doc.fileSize)}</p>
                        )}
                        {doc.issuedAt && (
                          <p><span className="font-medium">Дата выдачи:</span> {new Date(doc.issuedAt).toLocaleDateString('ru-RU')}</p>
                        )}
                        {doc.expiresAt && (
                          <p><span className="font-medium">Срок действия:</span> {new Date(doc.expiresAt).toLocaleDateString('ru-RU')}</p>
                        )}
                        {doc.moderatorNotes && (
                          <p><span className="font-medium">Комментарий модератора:</span> {doc.moderatorNotes}</p>
                        )}
                        {doc.rejectionReason && (
                          <p><span className="font-medium text-red-600">Причина отклонения:</span> {doc.rejectionReason}</p>
                        )}
                        {doc.moderatedAt && doc.moderator && (
                          <p><span className="font-medium">Модератор:</span> {doc.moderator.name || 'Не указано'} ({doc.moderator.email}) - {new Date(doc.moderatedAt).toLocaleString('ru-RU')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc)
                          setShowDetails(true)
                          setModeratorNotes(doc.moderatorNotes || '')
                          setRejectionReason(doc.rejectionReason || '')
                        }}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Подробнее
                      </button>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Просмотр
                      </a>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Скачать
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модальное окно для модерации */}
        {showDetails && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Модерация документа: {getDocumentTypeText(selectedDocument.docType)}
                </h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Вендор:</span>
                    <p className="text-gray-600">{selectedDocument.vendor.displayName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{selectedDocument.vendor.user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Файл:</span>
                    <p className="text-gray-600">{selectedDocument.fileName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Размер:</span>
                    <p className="text-gray-600">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий модератора
                  </label>
                  <textarea
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Добавьте комментарий..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Причина отклонения (если отклоняете)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Укажите причину отклонения..."
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetails(false)
                    setSelectedDocument(null)
                    setModeratorNotes('')
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleModeration(selectedDocument.id, 'APPROVED')}
                  disabled={actionLoading === selectedDocument.id}
                  className="inline-flex items-center px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedDocument.id ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Одобрить
                </button>
                <button
                  onClick={() => handleModeration(selectedDocument.id, 'REJECTED')}
                  disabled={actionLoading === selectedDocument.id || !rejectionReason}
                  className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedDocument.id ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
