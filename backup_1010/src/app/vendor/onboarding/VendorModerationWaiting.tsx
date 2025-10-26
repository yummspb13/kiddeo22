"use client"

import { Clock, CheckCircle, Mail, Phone } from "lucide-react"

interface Vendor {
  id: number
  displayName: string
  cityId: number
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  kycStatus: string
  createdAt: string
}

interface VendorModerationWaitingProps {
  vendor: Vendor
}

export default function VendorModerationWaiting({ vendor }: VendorModerationWaitingProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ваша заявка отправлена!</h1>
          <p className="mt-2 text-gray-600">
            Мы получили ваши данные и сейчас проверяем их
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Заявка на модерации
            </h2>
            <p className="text-gray-600 mb-6">
              Ваша заявка на регистрацию вендора "{vendor.displayName}" отправлена на модерацию. 
              Обычно проверка занимает 1-2 рабочих дня.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Ожидайте уведомления
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Мы отправим вам email с результатом модерации на адрес: <strong>{vendor.email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Дата подачи заявки: {new Date(vendor.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Что дальше?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Проверка документов</h4>
                <p className="text-sm text-gray-600">
                  Наши модераторы проверят предоставленные вами документы и информацию
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                  <span className="text-sm font-medium text-gray-600">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Уведомление о результате</h4>
                <p className="text-sm text-gray-600">
                  Вы получите email с результатом модерации и дальнейшими инструкциями
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                  <span className="text-sm font-medium text-gray-600">3</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Начало работы</h4>
                <p className="text-sm text-gray-600">
                  После одобрения вы сможете создавать события и управлять своим профилем
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Нужна помощь?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email поддержки</p>
                <p className="text-sm text-gray-600">support@kidsreview.ru</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Телефон поддержки</p>
                <p className="text-sm text-gray-600">+7 (800) 123-45-67</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
