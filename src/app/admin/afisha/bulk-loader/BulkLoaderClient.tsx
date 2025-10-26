'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Calendar, MapPin, Loader2 } from 'lucide-react'

interface UploadResult {
  success: boolean
  message: string
  details?: string
  count?: number
  errors?: string[]
}

export default function BulkLoaderClient() {
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  
  const eventsFileRef = useRef<HTMLInputElement>(null)
  const venuesFileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File, type: 'events' | 'venues') => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Ошибка при загрузке файла',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (type: 'events' | 'venues') => {
    setDownloading(true)
    
    try {
      const response = await fetch(`/api/admin/bulk-download?type=${type}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-${new Date().toISOString().slice(0, 10)}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: 'Ошибка при скачивании файла',
          details: error.message
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Ошибка при скачивании файла',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Табы */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Мероприятия
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'venues'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Места
        </button>
      </div>

      {/* Контент для мероприятий */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Скачать шаблон */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Скачать шаблон мероприятий</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Скачайте Excel файл с текущими мероприятиями для редактирования
                </p>
              </div>
              <button
                onClick={() => handleDownload('events')}
                disabled={downloading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Скачать Excel
              </button>
            </div>
          </div>

          {/* Загрузить файл */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded mb-4">Загрузить мероприятия</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Перетащите Excel файл с мероприятиями или нажмите для выбора
              </p>
              <input
                ref={eventsFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'events')
                }}
              />
              <button
                onClick={() => eventsFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center mx-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Выбрать файл
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Контент для мест */}
      {activeTab === 'venues' && (
        <div className="space-y-6">
          {/* Скачать шаблон */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Скачать шаблон мест</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Скачайте Excel файл с текущими местами для редактирования
                </p>
              </div>
              <button
                onClick={() => handleDownload('venues')}
                disabled={downloading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Скачать Excel
              </button>
            </div>
          </div>

          {/* Загрузить файл */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-unbounded mb-4">Загрузить места</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Перетащите Excel файл с местами или нажмите для выбора
              </p>
              <input
                ref={venuesFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'venues')
                }}
              />
              <button
                onClick={() => venuesFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center mx-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Выбрать файл
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Результат загрузки */}
      {result && (
        <div className={`rounded-lg border p-4 ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.message}
              </h4>
              {result.details && (
                <p className={`text-sm mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.details}
                </p>
              )}
              {result.count && (
                <p className={`text-sm mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  Обработано записей: {result.count}
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700">Ошибки:</p>
                  <ul className="text-sm text-red-600 mt-1 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-900">Инструкции по использованию</h4>
            <div className="text-sm text-blue-700 mt-2 space-y-1">
              <p>• Сначала скачайте шаблон с текущими данными</p>
              <p>• Отредактируйте данные в Excel (добавьте новые записи или измените существующие)</p>
              <p>• Загрузите измененный файл обратно</p>
              <p>• Система проверит на дубли и добавит новые записи в черновики</p>
              <p>• При ошибках будет показан подробный отчет</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
