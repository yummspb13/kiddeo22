'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CatalogVenueCard } from './CatalogVenueCard';

// Функция для рендеринга TipTap контента
function renderTipTapContent(node: any): React.ReactNode {
  if (!node) return null;
  
  if (typeof node === 'string') {
    return node;
  }
  
  if (node.type === 'doc') {
    return <div>{node.content?.map((child: any, index: number) => 
      <div key={index}>{renderTipTapContent(child)}</div>
    )}</div>;
  }
  
  if (node.type === 'paragraph') {
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    return <p className="mb-4">{content}</p>;
  }
  
  if (node.type === 'heading') {
    const level = node.attrs?.level || 1;
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    const className = `font-bold mb-4 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`;
    
    if (level === 1) return <h1 className={className}>{content}</h1>;
    if (level === 2) return <h2 className={className}>{content}</h2>;
    if (level === 3) return <h3 className={className}>{content}</h3>;
    if (level === 4) return <h4 className={className}>{content}</h4>;
    if (level === 5) return <h5 className={className}>{content}</h5>;
    if (level === 6) return <h6 className={className}>{content}</h6>;
    return <h1 className={className}>{content}</h1>;
  }
  
  if (node.type === 'text') {
    let text = node.text || '';
    
    // Применяем форматирование
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') {
          text = <strong key={Math.random()}>{text}</strong>;
        } else if (mark.type === 'italic') {
          text = <em key={Math.random()}>{text}</em>;
        } else if (mark.type === 'code') {
          text = <code key={Math.random()} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>;
        } else if (mark.type === 'link') {
          const href = mark.attrs?.href || '#';
          const target = mark.attrs?.target || '_blank';
          text = <a key={Math.random()} href={href} target={target} className="text-blue-600 underline hover:text-blue-800">{text}</a>;
        }
      }
    }
    
    return text;
  }
  
  if (node.type === 'bulletList') {
    const content = node.content?.map((child: any, index: number) => 
      <li key={index} className="mb-2">{renderTipTapContent(child)}</li>
    ) || '';
    return <ul className="list-disc list-inside mb-4 space-y-1">{content}</ul>;
  }
  
  if (node.type === 'listItem') {
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    return <span>{content}</span>;
  }
  
  if (node.type === 'blockquote') {
    const content = node.content?.map((child: any, index: number) => 
      <div key={index}>{renderTipTapContent(child)}</div>
    ) || '';
    return <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 bg-gray-50 p-4 rounded-r">{content}</blockquote>;
  }
  
  if (node.type === 'image') {
    const src = node.attrs?.src || '';
    const alt = node.attrs?.alt || '';
    const title = node.attrs?.title || '';
    
    // Проверяем, является ли это эмодзи (изображение с CDN эмодзи)
    const isEmoji = src.includes('emoji-datasource') || src.includes('emoji') || 
                   (alt && alt.includes('emoji')) || 
                   (title && title.includes('emoji'));
    
    if (isEmoji) {
      // Для эмодзи пытаемся извлечь Unicode эмодзи из alt или title
      const emojiMatch = alt?.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
      if (emojiMatch && emojiMatch.length > 0) {
        return <span className="inline-block text-lg mx-0.5">{emojiMatch[0]}</span>;
      }
      
      // Если не удалось извлечь Unicode эмодзи, используем изображение с маленьким размером
      return <img key={Math.random()} src={src} alt={alt} title={title} className="inline-block w-5 h-5 align-text-bottom mx-0.5" />;
    }
    
    // Для обычных изображений используем полный размер
    return <img key={Math.random()} src={src} alt={alt} title={title} className="max-w-full h-auto rounded-lg mb-4" />;
  }
  
  if (node.type === 'hardBreak') {
    return <br key={Math.random()} />;
  }
  
  // Для неизвестных типов просто рендерим содержимое
  if (node.content) {
    return node.content.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    );
  }
  
  return null;
}
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Heart,
  Share2,
  Building
} from 'lucide-react';
import Gallery from './Gallery'
import SimpleVenueReviews from './SimpleVenueReviews';
import VenueMap from './VenueMap';
import PublicQA from './PublicQA';
import PublicNews from './PublicNews';
import VenueOwnerClaim from './VenueOwnerClaim';
import { getPriceDisplay } from '@/utils/priceDisplay';

type Venue = {
  id: number;
  name: string;
  slug: string;
  address: string;
  heroImage: string | null;
  coverImage: string | null;
  tariff: 'FREE' | 'SUPER' | 'MAXIMUM';
  priceFrom?: number | null;
  priceTo?: number | null;
  ageFrom?: number | null;
  ageTo?: number | null;
  workingHours?: string | null;
  richDescription?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  district?: string | null;
  metro?: string | null;
  additionalImages?: string[];
  isFree?: boolean;
  features?: Array<{ icon?: string; text: string }>
  capacity?: number | null;
  vendor: {
    id: number;
    userId: number;
    displayName: string;
    description?: string | null;
    logo: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  subcategory: {
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
    };
  };
  _count: {
    parameters: number;
  };
  Review?: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    User_Review_userIdToUser: {
      name: string;
      image: string | null;
    };
  }>;
};

type SimilarVenue = {
  id: number;
  name: string;
  slug: string;
  address: string;
  heroImage: string | null;
  vendor: {
    displayName: string;
    logo: string | null;
  };
  subcategory: {
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
    };
  };
  _count: {
    parameters: number;
  };
};

type Props = {
  venue: Venue;
  similarVenues: SimilarVenue[];
  city: {
    id: number;
    name: string;
    slug: string;
  };
};

// Конфигурация блоков для каждого тарифа
const TARIFF_CONFIG = {
      FREE: {
        tabs: ['description'],
        infoBlocks: ['price', 'basicInfo', 'organizer'],
        additionalBlocks: ['map', 'reviews', 'similarVenues'],
        features: {
          maxImages: 3,
          showAdvancedInfo: false,
          showContactDetails: true, // Показываем контакты для FREE
          showReviews: true,
          showMap: true,
          showQA: false,
          showNews: false,
          showFeatures: false
        }
      },
  SUPER: {
    tabs: ['description', 'features', 'qa', 'news'],
    infoBlocks: ['price', 'basicInfo', 'organizer'],
    additionalBlocks: ['map', 'reviews', 'similarVenues'],
    features: {
      maxImages: 10,
      showAdvancedInfo: true,
      showContactDetails: true,
      showReviews: true,
      showMap: true,
      showQA: true,
      showNews: true,
      showFeatures: true
    }
  },
  MAXIMUM: {
    tabs: ['description', 'features', 'qa', 'news'],
    infoBlocks: ['price', 'basicInfo', 'organizer'],
    additionalBlocks: ['map', 'reviews', 'similarVenues'],
    features: {
      maxImages: 25,
      showAdvancedInfo: true,
      showContactDetails: true,
      showReviews: true,
      showMap: true,
      showQA: true,
      showNews: true,
      showFeatures: true
    }
  }
} as const;

export default function VenueDetailsFull({ venue, similarVenues, city }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'qa' | 'news'>('description')
  const [ownershipInfo, setOwnershipInfo] = useState<{
    isOwner: boolean
    isAdmin: boolean
    isKiddeoEvents: boolean
    canClaim: boolean
    vendorId?: number
    vendorName?: string
  } | null>(null)
  
  // Получаем конфигурацию для текущего тарифа
  const tariffConfig = TARIFF_CONFIG[venue.tariff] || TARIFF_CONFIG.FREE;

  // Проверяем владельца места
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        // Получаем userId из сессии
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        const userId = session?.user?.id ? parseInt(session.user.id) : null
        
        // Простая проверка для демонстрации
        const isKiddeoEvents = venue.vendor.displayName === 'Kiddeo Events' || 
                              venue.vendor.displayName === 'Kiddeo'
        
        // Проверяем, является ли пользователь владельцем места
        const isOwner = userId ? venue.vendor.userId === userId : false
        
        setOwnershipInfo({
          isOwner,
          isAdmin: false,
          isKiddeoEvents,
          canClaim: !isOwner && isKiddeoEvents, // Показываем кнопку клейма только если пользователь НЕ владелец и это Kiddeo Events
          vendorId: venue.vendor.id,
          vendorName: venue.vendor.displayName
        })
      } catch (error) {
        console.error('Error checking ownership:', error)
      }
    }

    checkOwnership()
  }, [venue.id, venue.vendor.displayName, venue.vendor.id, venue.vendor.userId])
  
  // Изображения с учетом тарифа (обложка + additionalImages уже ограничены на сервере)
  const galleryImages = [venue.coverImage, ...(venue as any).additionalImages || []].filter(Boolean) as string[];

  // Вычисляем средний рейтинг из реальных отзывов
  const averageRating = (() => {
    if (!venue.Review || venue.Review.length === 0) return '0.0';
    const totalRating = venue.Review.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / venue.Review.length).toFixed(1);
  })();

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  }

  const scrollToReviews = () => {
    const reviewsElement = document.querySelector('[data-reviews-section]')
    if (reviewsElement) {
      reviewsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleShare = async () => {
    const currentUrl = window.location.href
    const shareUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}utm_source=share&utm_medium=button&utm_campaign=venue&ref=user_${Date.now()}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${venue.name} - Kiddeo`,
          text: `Посмотрите это место: ${venue.name}`,
          url: shareUrl
        })
      } catch (error) {
        console.log('Поделиться отменено')
      }
    } else {
      // Fallback для браузеров без поддержки Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl)
        addToast({
          type: 'success',
          title: 'Ссылка скопирована!',
          message: 'Ссылка скопирована в буфер обмена!',
          duration: 3000
        })
      } catch (error) {
        // Если не удалось скопировать, показываем модалку с ссылкой
        const modal = document.createElement('div')
        modal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 400px; margin: 20px;">
              <h3 style="margin: 0 0 15px 0; font-family: 'Unbounded', sans-serif; font-weight: bold;">Поделиться ссылкой</h3>
              <input type="text" value="${shareUrl}" readonly style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 15px;">
              <button onclick="this.parentElement.parentElement.remove()" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Unbounded', sans-serif; font-weight: bold;">Закрыть</button>
            </div>
          </div>
        `
        document.body.appendChild(modal)
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[250px] overflow-hidden rounded-t-3xl max-w-7xl mx-auto px-4">
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 via-transparent to-pink-800/20"></div>
          <div 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
            className="absolute inset-0 opacity-30"
          ></div>
        </div>
        
        {/* Обложка места с прозрачностью */}
        {venue.coverImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
            style={{
              backgroundImage: `url(${venue.coverImage})`
            }}
          ></div>
        )}
        
        {/* Дополнительное тонирование */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping"></div>
        
        {/* Контент */}
        <div className="relative z-10 h-full flex items-start pt-8">
          <div className="max-w-7xl mx-auto px-4 w-full">
            {/* Кнопка избранного */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={toggleFavorite}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Заголовок и информация */}
            <div className="text-white">
              <h1 className="text-5xl font-black mb-6 font-unbounded">
                {venue.name}
              </h1>
              
              
              <div className="flex items-center space-x-8 text-sm font-medium font-unbounded">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="w-6 h-6 mr-3" />
                  <span>{venue.address}</span>
                </div>
                
                <button 
                  onClick={scrollToReviews}
                  className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/30 transition-all duration-300 cursor-pointer group"
                >
                  <Star className="w-6 h-6 mr-3 fill-current text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-yellow-200 transition-colors duration-300">
                    {averageRating} ({venue.Review?.length || 0} отзывов)
                  </span>
                </button>
                
                {venue.tariff !== 'FREE' && (
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Users className="w-6 h-6 mr-3" />
                    <span>
                      {venue.ageFrom != null ? `от ${venue.ageFrom} лет` : 'Возраст не указан'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Волновая граница */}
      <div className="relative -mt-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 transform rotate-180">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".8" fill="white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".9" fill="white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"></path>
        </svg>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Левая колонка - Описание / Вкладки */}
          <div className="lg:col-span-2">
                      {/* Галерея изображений */}
                      <div className="mb-2 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="pb-2">
                          <Gallery
                            images={galleryImages}
                            variant="slider"
                          />
                        </div>
                      </div>

            {/* Вкладки */}
            <div className="mt-10 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl transition-all duration-300">
              {/* Табы */}
              <div className="flex flex-wrap gap-2 px-4 pt-4">
                {[
                  { id: 'description', label: 'Описание' },
                  { id: 'features', label: 'Особенности' },
                  { id: 'qa', label: 'Задайте вопрос' },
                  { id: 'news', label: 'Новости' },
                ].filter(tab => tariffConfig.tabs.includes(tab.id as any)).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`font-unbounded px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Контент табов */}
              <div className="p-8">
                {activeTab === 'description' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Описание</h2>
                    <div className="prose max-w-none">
                      {venue.richDescription ? (
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-unbounded">
                          {(() => {
                            try {
                              const json = JSON.parse(venue.richDescription);
                              return renderTipTapContent(json);
                            } catch (error) {
                              // Если не JSON, отображаем как есть
                              return venue.richDescription;
                            }
                          })()}
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-lg font-unbounded whitespace-pre-line">
                          {venue.description || 'Описание места будет добавлено позже.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && tariffConfig.features.showFeatures && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Особенности</h2>
                    {venue.features && venue.features.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {venue.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {f.icon ? (
                              <img 
                                src={f.icon} 
                                alt={f.text}
                                className="mt-1 w-6 h-6 rounded-full object-cover border border-violet-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'inline-flex';
                                  }
                                }}
                              />
                            ) : (
                              <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                                •
                              </span>
                            )}
                            <span className="text-gray-800 text-lg font-unbounded">{f.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 font-unbounded">Информация об особенностях будет добавлена позже.</p>
                    )}
                  </div>
                )}

                {activeTab === 'qa' && tariffConfig.features.showQA && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Задайте вопрос</h2>
                    <PublicQA venueId={venue.id} />
                  </div>
                )}

                {activeTab === 'news' && tariffConfig.features.showNews && (
                  <PublicNews venueId={venue.id} />
                )}
              </div>
            </div>

            {/* Карта */}
            {venue.lat && venue.lng && tariffConfig.features.showMap && (
              <div className="mt-5 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8 pb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 font-unbounded">Локация на карте</h2>
                  {venue.address && <div className="mb-3 text-sm text-gray-600 font-unbounded">{venue.address}</div>}
                </div>
                <div className="p-8 pt-0">
                  <VenueMap 
                    lat={venue.lat} 
                    lng={venue.lng} 
                    venueName={venue.name}
                    address={venue.address}
                    className="h-96"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Правая колонка - Информация */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Цена и бронирование */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                  {(() => {
                    const priceInfo = getPriceDisplay(venue);
                    return (
                      <>
                        <div className="text-4xl font-black text-gray-900 mb-3 font-unbounded">
                          {priceInfo.mainText}
                        </div>
                        {priceInfo.subText && (
                          <div className="text-sm text-gray-500 font-unbounded">
                            {priceInfo.subText}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      // Прокручиваем к блоку отзывов
                      const reviewsElement = document.querySelector('[data-reviews-section]')
                      if (reviewsElement) {
                        reviewsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-unbounded"
                  >
                    <div className="flex flex-col items-center">
                      <span>Были тут?</span>
                      <span>Оцените место!</span>
                    </div>
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      isFavorite
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-300'
                    } font-unbounded`}
                  >
                    <Heart className={`w-6 h-6 inline mr-3 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300 font-unbounded"
                  >
                    <Share2 className="w-6 h-6 inline mr-3" />
                    Поделиться
                  </button>
                </div>
              </div>

              {/* Информация о месте */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Информация о месте</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Адрес</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.address}</div>
                    </div>
                  </div>
                  
                  {tariffConfig.features.showAdvancedInfo && (
                    <>
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 font-unbounded">Район</div>
                          <div className="text-sm text-gray-600 font-unbounded">{venue.district || 'Не указан'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 font-unbounded">Метро</div>
                          <div className="text-sm text-gray-600 font-unbounded">{venue.metro || 'Не указано'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 font-unbounded">Возраст</div>
                          <div className="text-sm text-gray-600 font-unbounded">
                            {venue.ageFrom ? `от ${venue.ageFrom} лет` : 'Любой возраст'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 font-unbounded">Режим работы</div>
                          <div className="text-sm text-gray-600 font-unbounded">
                            {venue.workingHours || 'Не указан'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Организатор */}
              {tariffConfig.features.showContactDetails && (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Организатор</h3>
                <div className="space-y-4">
                  {/* Информация об организаторе */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <Building className="w-8 h-8 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg font-unbounded">{venue.vendor.displayName}</div>
                      <div className="text-sm text-gray-500 font-unbounded">{venue.subcategory.name}</div>
                    </div>
                  </div>
                  
                  {/* Компонент клейма места на отдельной строке */}
                  {ownershipInfo && (
                    <div className="flex justify-center">
                      <VenueOwnerClaim
                        venueId={venue.id}
                        venueName={venue.name}
                        isOwner={ownershipInfo.isOwner}
                        onClaimSuccess={() => {
                          console.log('Claim submitted successfully')
                          // Можно обновить состояние или показать уведомление
                        }}
                      />
                    </div>
                  )}
                </div>
                </div>
              )}
            </div>
          </div>

            {/* Отзывы на всю ширину */}
            {tariffConfig.features.showReviews && (
              <div className="lg:col-span-3 mt-[-20px]" data-reviews-section>
                <SimpleVenueReviews venueId={venue.id} />
              </div>
            )}
        </div>
      </div>

      {/* Похожие места */}
      <div className="mt-[-14px] max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">Похожие места</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {similarVenues.slice(0, 8).map((similarVenue) => (
            <CatalogVenueCard 
              key={similarVenue.id} 
              venue={similarVenue} 
              citySlug={city.slug} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}