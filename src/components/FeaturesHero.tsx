'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Route, Gift, BookOpen, Sparkles, ArrowRight, Users } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: MapPin,
    title: "События города на карте",
    description: "Найдите все детские события рядом с вами на интерактивной карте",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    backgroundImage: "/images/card_afisha.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 0
  },
  {
    id: 2,
    icon: Star,
    title: "Подборки интересных мест",
    description: "Кураторские подборки лучших мест и событий этого месяца",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    backgroundImage: "/images/card_place.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 100
  },
  {
    id: 3,
    icon: Users,
    title: "Места для всей семьи",
    description: "Откройте для себя зоопарки, музеи и развлечения рядом с вами",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    backgroundImage: "/images/card_zoo.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 200
  },
  {
    id: 4,
    icon: Route,
    title: "Маршруты на выходные",
    description: "Готовые маршруты от утра до вечера для идеального дня",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    backgroundImage: "/images/card_navigate.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 300
  },
  {
    id: 5,
    icon: Gift,
    title: "Праздники (скоро)",
    description: "Соберите детский праздник в корзину с гарантией проведения",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    backgroundImage: "/images/card_bdays.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 400
  },
  {
    id: 6,
    icon: BookOpen,
    title: "Блог для родителей",
    description: "Полезные статьи и советы для организации детского досуга",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    backgroundImage: "/images/card_blog.jpg",
    gradient: "from-black/10 via-black/60 to-black/80",
    delay: 500
  }
];


export default function FeaturesHero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-10 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-4">
        {/* Collapsed State */}
        {!isExpanded && (
          <div 
            className="relative text-center py-20 rounded-3xl overflow-hidden"
            style={{
              backgroundImage: 'url(/images/about_bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background overlay with better contrast */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="block">
                <button
                onClick={() => setIsExpanded(true)}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl animate-glow cursor-pointer animate-fadeInUp"
                style={{ animationDelay: '0.4s' }}
              >
                <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">Посмотреть о чем наш сервис</span>
                <span className="sm:hidden">О чем наш сервис</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div 
            className="animate-fadeInUp relative rounded-3xl overflow-hidden"
            style={{
              backgroundImage: 'url(/images/about_bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background overlay with 30% opacity */}
            <div className="absolute inset-0 bg-white/70"></div>
            
            {/* Content */}
            <div className="relative z-10 p-8">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-base font-semibold mb-6 animate-fadeInUp">
                <Sparkles className="w-4 h-4 mr-2" />
                Всё для детского досуга в одном месте
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 animate-fadeInUp animate-gradient" style={{ animationDelay: '0.2s' }}>
                Мы собрали весь детский досуг в один сервис
                <br />
              </h2>
              
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                Планируйте свои дни с детьми продуктивнее вместе с нами. 
                Мы сделали поиск и планирование досуга простым и увлекательным.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                
                return (
                  <div
                    key={feature.id}
                    className={`group relative p-4 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden transform card-3d ${
                      isActive 
                        ? 'shadow-3d-hover scale-105 border border-white/30 card-3d-active' 
                        : 'shadow-3d hover:shadow-3d-hover hover:scale-105 hover:-rotate-1 hover:-translate-y-2'
                    } animate-fadeInUp`}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      animationDelay: `${feature.delay}ms`,
                      backgroundImage: `url(${feature.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    {/* Background overlay for better text visibility */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} transition-opacity duration-300`}></div>
                    
                    {/* 3D depth effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none"></div>
                    
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-float shadow-lg`} style={{ animationDelay: `${feature.delay}ms` }}>
                        <Icon className={`w-5 h-5 text-white drop-shadow-lg`} />
                        {/* 3D glow effect */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 shadow-lg`}></div>
                        {/* Inner highlight */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>

                      {/* Text content */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-100 transition-colors duration-300 drop-shadow-lg">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300 drop-shadow-md">
                        {feature.description}
                      </p>

                      {/* Arrow indicator */}
                      <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 group-hover:rotate-12 shadow-lg`}>
                        <ArrowRight className="w-3 h-3 text-white drop-shadow-lg" />
                      </div>

                      {/* Pulse effect for active item */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl border border-white/50 animate-ping opacity-20"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        /* 3D Card Effects */
        .card-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .card-3d:hover {
          transform: rotateY(-5deg) rotateX(5deg) translateZ(20px);
        }
        
        .card-3d-active {
          transform: rotateY(-2deg) rotateX(2deg) translateZ(10px);
        }
        
        /* Enhanced shadows */
        .shadow-3d {
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.3),
            0 5px 10px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .shadow-3d-hover {
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 10px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </section>
  );
}
