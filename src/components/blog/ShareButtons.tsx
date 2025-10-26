'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Check, 
  QrCode
} from 'lucide-react'
import { 
  FaVk, 
  FaTelegram, 
  FaOdnoklassniki, 
  FaWhatsapp, 
  FaTwitter 
} from 'react-icons/fa'
import QRCodeLib from 'qrcode'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [hoveredQR, setHoveredQR] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  // Генерируем QR-код при изменении URL
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrDataUrl = await QRCodeLib.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    if (url) {
      generateQRCode()
    }
  }, [url])

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || '')

    let shareUrl = ''

    switch (platform) {
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&description=${encodedDescription}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'ok':
        shareUrl = `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          return
        } catch (err) {
          console.error('Failed to copy: ', err)
        }
        return
      case 'qr':
        // При клике переключаем модальное окно
        setShowQR(!showQR)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const buttonVariants = {
    rest: { 
      scale: 1,
      rotateY: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    hover: { 
      scale: 1.15,
      rotateY: 5,
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
    },
    tap: { 
      scale: 0.9,
      rotateY: -2
    }
  }

  // Приоритет российских платформ с 3D эффектами
  const shareButtons = [
    { 
      platform: 'vk', 
      icon: <FaVk className="w-4 h-4" />, 
      label: 'ВКонтакте', 
      color: 'bg-gradient-to-br from-[#0077FF] to-[#0056CC] hover:from-[#0056CC] hover:to-[#003D99] text-white' 
    },
    { 
      platform: 'telegram', 
      icon: <FaTelegram className="w-4 h-4" />, 
      label: 'Telegram', 
      color: 'bg-gradient-to-br from-[#0088cc] to-[#006699] hover:from-[#006699] hover:to-[#004466] text-white' 
    },
    { 
      platform: 'ok', 
      icon: <FaOdnoklassniki className="w-4 h-4" />, 
      label: 'Одноклассники', 
      color: 'bg-gradient-to-br from-[#ee8208] to-[#cc6a00] hover:from-[#cc6a00] hover:to-[#aa5500] text-white' 
    },
    { 
      platform: 'whatsapp', 
      icon: <FaWhatsapp className="w-4 h-4" />, 
      label: 'WhatsApp', 
      color: 'bg-gradient-to-br from-[#25D366] to-[#1ea952] hover:from-[#1ea952] hover:to-[#17803e] text-white' 
    },
    { 
      platform: 'twitter', 
      icon: <FaTwitter className="w-4 h-4" />, 
      label: 'X (Twitter)', 
      color: 'bg-gradient-to-br from-[#1DA1F2] to-[#0d8bd9] hover:from-[#0d8bd9] hover:to-[#0b73c0] text-white' 
    },
    { 
      platform: 'copy', 
      icon: copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />, 
      label: copied ? 'Скопировано!' : 'Копировать ссылку', 
      color: copied 
        ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
        : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
    },
    { 
      platform: 'qr', 
      icon: <QrCode className="w-4 h-4" />, 
      label: 'QR-код', 
      color: showQR 
        ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white' 
        : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Поделиться:</span>
        <div className="flex gap-3 flex-wrap">
          {shareButtons.map((button) => (
            <motion.button
              key={button.platform}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
              onClick={() => handleShare(button.platform)}
              className={`w-8 h-8 rounded-xl transition-all duration-300 ${button.color} flex items-center justify-center transform-gpu`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              title={button.label}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.1,
                  rotateY: 10
                }}
                transition={{ duration: 0.2 }}
              >
                {button.icon}
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xl max-w-sm mx-auto"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">QR-код для статьи</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-32 h-32 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">Отсканируйте QR-код для быстрого доступа к статье</p>
            <div className="text-xs text-gray-500 mb-4 break-all">{url}</div>
            <button
              onClick={() => setShowQR(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

