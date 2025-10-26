'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface EventHeroProps {
  title: string
  description?: string
  isRecommended?: boolean
}

export default function EventHero({ 
  title, 
  description, 
  isRecommended = false
}: EventHeroProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement actual favorite functionality with API
    console.log('Toggle favorite for event:', title)
  }
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white rounded-3xl">
      {/* Анимированные частицы */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* Kiddeo рекомендует - левый верхний угол */}
            {isRecommended && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Kiddeo рекомендует
              </div>
            )}
            
            {/* Кнопка избранного - правый верхний угол */}
            <button 
              onClick={handleFavoriteClick}
              className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <Heart 
                className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 font-unbounded animate-fade-in">
              {title}
            </h1>
            
            {description && (
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Анимированная волна */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="w-full h-48 text-white transform rotate-180 scale-x-[1.3] origin-center" 
          viewBox="0 0 1200 180" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
              <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.6)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
            </linearGradient>
            <linearGradient id="waveGradientWhite" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
              <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,1)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
            </linearGradient>
          </defs>
          
          {/* Первая волна - полностью белая */}
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            fill="white"
            className="animate-wave-1"
          />
          
          {/* Вторая волна - полупрозрачная */}
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradient)"
            opacity="0.7"
            className="animate-wave-2"
          />
          
          {/* Третья волна - белая */}
          <path 
            d="M0,0V30.81C13,51.92,27.64,71.86,47.69,87.05,99.41,126.27,165,126,224.58,106.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradientWhite)"
            opacity="0.6"
            className="animate-wave-3"
          />
          
          {/* Четвертая волна - полупрозрачная */}
          <path 
            d="M0,0V60.81C13,81.92,27.64,101.86,47.69,117.05,99.41,156.27,165,156,224.58,136.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradient)"
            opacity="0.4"
            className="animate-wave-1"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes wave-1 {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-25px) translateY(-10px); }
        }
        
        @keyframes wave-2 {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(25px) translateY(5px); }
        }
        
        @keyframes wave-3 {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-15px) translateY(-15px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-wave-1 {
          animation: wave-1 8s ease-in-out infinite;
        }
        
        .animate-wave-2 {
          animation: wave-2 6s ease-in-out infinite;
        }
        
        .animate-wave-3 {
          animation: wave-3 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  )
}
