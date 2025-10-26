'use client'

import { useState } from 'react'
import { Copy, Users, Gift, Check, X } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { createPortal } from 'react-dom'

export default function InviteFriendButton() {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { user } = useUser()

  const generateInviteCode = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setInviteCode(data.inviteCode)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error generating invite code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!inviteCode) return
    
    const inviteUrl = `${window.location.origin}/auth/register?ref=${inviteCode}`
    await navigator.clipboard.writeText(inviteUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={generateInviteCode}
        disabled={isLoading}
        className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-unbounded-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-w-[320px]"
      >
        <div className="relative z-10 flex items-center w-full">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Users className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">
              {isLoading ? 'Генерируем...' : 'Пригласить друга'}
            </span>
          </div>
          <div className="ml-5 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold animate-pulse whitespace-nowrap">
            +200 баллов
          </div>
        </div>
        
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Блестящий эффект */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Модальное окно с реферальной ссылкой */}
      {showModal && inviteCode && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-fadeInUp relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Крестик для закрытия */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-unbounded-bold text-gray-900 mb-2">
                Пригласите друга!
              </h3>
              <p className="text-gray-600 font-unbounded-regular">
                Получите <span className="text-yellow-600 font-bold">200 баллов</span> за каждого друга
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-unbounded-semibold text-gray-700 mb-2">
                  Ваша реферальная ссылка:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${inviteCode}`}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Копировать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-unbounded-regular">
                  💡 <strong>Совет:</strong> Поделитесь ссылкой в социальных сетях или отправьте другу по WhatsApp
                </p>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
