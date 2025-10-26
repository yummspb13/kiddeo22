'use client'

import { useState } from 'react'
import { Building, CheckCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface VenueOwnerClaimProps {
  venueId: number
  venueName: string
  isOwner: boolean
  onClaimSuccess?: () => void
}

export default function VenueOwnerClaim({ 
  venueId, 
  venueName, 
  isOwner, 
  onClaimSuccess 
}: VenueOwnerClaimProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { addToast } = useToast()

  const handleClaim = async () => {
    setIsClaiming(true)
    setClaimStatus('idle')
    
    try {
      // Используем существующий API для клейма места
      const formData = new FormData()
      formData.append('venueId', venueId.toString())
      formData.append('fullName', 'Владелец компании') // В реальном приложении получить из формы
      formData.append('email', 'owner@company.com') // В реальном приложении получить из формы
      formData.append('phone', '+7 (999) 123-45-67') // В реальном приложении получить из формы
      formData.append('position', 'Владелец')
      formData.append('comment', `Заявка на клейм места "${venueName}"`)

      const response = await fetch('/api/listings/claim', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setClaimStatus('success')
        onClaimSuccess?.()
        
        // Показываем красивое уведомление об успехе
        addToast({
          type: 'success',
          title: 'Заявка подана успешно!',
          message: 'Ваша заявка на управление местом отправлена. Мы рассмотрим её в ближайшее время.',
          duration: 6000
        })
        
        setTimeout(() => {
          setIsModalOpen(false)
          setClaimStatus('idle')
        }, 2000)
      } else {
        let errorMessage = 'Произошла ошибка при отправке заявки'
        try {
          const responseText = await response.text()
          console.log('🔍 Raw response:', responseText)
          
          if (responseText) {
            const errorData = JSON.parse(responseText)
            console.log('🔍 Parsed error data:', errorData)
            if (errorData.error) {
              errorMessage = errorData.error
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`
        }
        // console.error('Claim error message:', errorMessage) // Убрано для чистоты консоли
        setClaimStatus('error')
        
        // Показываем красивое уведомление
        addToast({
          type: 'error',
          title: 'Ошибка при подаче заявки',
          message: errorMessage,
          duration: 8000,
          action: {
            label: 'Зарегистрироваться как вендор',
            onClick: () => {
              window.location.href = '/vendor/register'
            }
          }
        })
      }
    } catch (error) {
      console.error('Claim error:', error)
      setClaimStatus('error')
    } finally {
      setIsClaiming(false)
    }
  }

  if (isOwner) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-green-800 font-unbounded">
            Это ваша компания
          </span>
          <p className="text-xs text-green-600 font-unbounded">
            Вы управляете этим местом
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Красивая кнопка в стиле сайта */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold font-unbounded text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center gap-2">
          <Building className="w-4 h-4" />
          <span>Это моя компания</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </button>

      {/* Красивая модалка в стиле сайта */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Заголовок с градиентом */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-unbounded">Клейм места</h3>
                  <p className="text-violet-100 font-unbounded">Заявить права на управление</p>
                </div>
              </div>
            </div>

            {/* Контент */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border border-violet-200">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="font-bold text-gray-900 font-unbounded">
                      Заявить права на "{venueName}"
                    </p>
                    <p className="text-sm text-gray-600 font-unbounded">
                      Получите полный контроль над информацией о месте
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span className="font-unbounded">Управление информацией о месте</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span className="font-unbounded">Добавление новостей и событий</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span className="font-unbounded">Ответы на отзывы клиентов</span>
                  </div>
                </div>
              </div>

              {/* Статус клейма */}
              {claimStatus === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 font-unbounded">
                      Заявка отправлена!
                    </p>
                    <p className="text-sm text-green-600 font-unbounded">
                      Мы свяжемся с вами в течение 24 часов
                    </p>
                  </div>
                </div>
              )}

              {claimStatus === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl mb-6">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 font-unbounded">
                      Ошибка при отправке
                    </p>
                    <p className="text-sm text-red-600 font-unbounded">
                      Попробуйте позже или обратитесь в поддержку
                    </p>
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold font-unbounded hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                  disabled={isClaiming}
                >
                  Отмена
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-2xl font-bold font-unbounded shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isClaiming ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Отправка...</span>
                    </div>
                  ) : (
                    'Заявить права'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
