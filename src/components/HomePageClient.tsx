'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SmartSearch from '@/components/SmartSearch';
import HomePageBlock from '@/components/homepage/HomePageBlock';
import FeaturesHero from '@/components/FeaturesHero';
import PullToRefreshWrapper from '@/components/PullToRefreshWrapper';
// Убрали VenueSections, так как все секции обрабатываются через HomePageBlock

interface HomePageClientProps {
  citySlug: string;
  cityName: string;
  initialHomepageContent: any;
}

export default function HomePageClient({
  citySlug,
  cityName,
  initialHomepageContent
}: HomePageClientProps) {
  const [homepageContent, setHomepageContent] = useState(initialHomepageContent);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentCitySlug, setCurrentCitySlug] = useState(citySlug);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Отслеживаем изменения города из URL
  useEffect(() => {
    const newCitySlug = searchParams.get('city') || 'moscow';
    if (newCitySlug !== currentCitySlug) {
      setCurrentCitySlug(newCitySlug);
      loadHomepageContent(newCitySlug);
    }
  }, [searchParams, currentCitySlug]);

  // Слушаем события смены города
  useEffect(() => {
    const handleCityChanged = () => {
      const newCitySlug = searchParams.get('city') || 'moscow';
      if (newCitySlug !== currentCitySlug) {
        setCurrentCitySlug(newCitySlug);
        loadHomepageContent(newCitySlug);
      }
    };

    window.addEventListener('cityChanged', handleCityChanged);
    return () => window.removeEventListener('cityChanged', handleCityChanged);
  }, [searchParams, currentCitySlug]);

  const loadHomepageContent = async (citySlug: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/homepage/content?citySlug=${citySlug}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const newContent = await response.json();
        setHomepageContent(newContent);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadHomepageContent(currentCitySlug);
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative text-white py-12 md:py-20 overflow-hidden" style={{
          backgroundImage: 'url(/images/mainhero_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Градиентный оверлей для лучшей читаемости текста */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-600/80"></div>
          {/* Shimmer эффект для фона */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer-bright"></div>

          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Найдите идеальное развлечение для вашего ребенка
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 px-4">
              Тысячи мероприятий, мест и услуг для детей в вашем городе
            </p>

            {/* Search в херо */}
            <div className="w-full px-4">
              <SmartSearch selectedCity={currentCitySlug} />
            </div>
          </div>
        </section>

        {/* Features Hero Section */}
        <FeaturesHero />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 md:py-8 w-full">
          {/* Динамические блоки главной страницы */}
          {Object.entries(homepageContent).map(([blockType, blockData]: [string, any]) => (
            <HomePageBlock
              key={blockType}
              blockType={blockType}
              title={blockData.customTitle}
              description={blockData.customDescription}
              content={blockData.content || []}
              citySlug={currentCitySlug}
            />
          ))}

          {/* Все секции обрабатываются через HomePageBlock выше */}
        </main>
      </div>
    </PullToRefreshWrapper>
  );
}
