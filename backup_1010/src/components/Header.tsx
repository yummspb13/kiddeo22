'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import AuthButton from './AuthButton';
import { CartButtonWithCounter } from './CartButtonWithCounter';
import { ToastContainer } from './Toast';
import PointsWidget from './PointsWidget';
import { useAuth } from '@/contexts/AuthContext';
import { saveCurrentCity, getCurrentCity } from '@/utils/cookies';
// Убираем импорт шрифта, используем CSS переменную напрямую;

type City = { slug: string; name: string };
type Props = { cities: City[] };

export default function Header({ cities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  
  // Проверяем авторизацию для страниц профиля
  const { user: session, isAuthenticated, openLoginModal } = useAuth();


  // ——— текущий город из query, пути, localStorage
  const urlCity = sp.get('city') ?? undefined;
  const pathCity =
    pathname.startsWith('/city/') ? pathname.split('/')[2] || undefined : undefined;
  const savedCity = typeof window !== 'undefined' ? getCurrentCity() : 'moskva';
  const initialCity = urlCity ?? pathCity ?? savedCity;

  const [city, setCity] = useState(initialCity);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => setCity(initialCity), [initialCity]);

  // Обработка параметра login=true для открытия модалки входа
  useEffect(() => {
    if (sp.get('login') === 'true' && !session) {
      // Небольшая задержка для корректного рендеринга
      setTimeout(() => {
        openLoginModal();
      }, 100);
    }
  }, [sp, session, openLoginModal]);

  // ——— функция для определения заголовка по URL
  const getPageTitle = (path: string, cityName: string) => {
    if (path.includes('/cart')) {
      return `КОРЗИНА`;
    }
    if (path.includes('/cat/events')) {
      return `АФИША СОБЫТИЙ`;
    }
    if (path.includes('/cat/venues')) {
      return `МЕСТА ДЛЯ ДЕТЕЙ`;
    }
    if (path.includes('/cat/parties')) {
      return `ОРГАНИЗАЦИЯ ДЕТСКИХ ПРАЗДНИКОВ`;
    }
    if (path.includes('/blog')) {
      return `БЛОГ О ДЕТСКИХ РАЗВЛЕЧЕНИЯХ`;
    }
    if (path.includes('/contacts')) {
      return `КОНТАКТЫ`;
    }
    if (path.includes('/profile')) {
      return `ЛИЧНЫЙ КАБИНЕТ`;
    }
    // Главная страница или другие страницы
    return `ДЕТСКИЕ РАЗВЛЕЧЕНИЯ В ${cityName.toUpperCase()}`;
  };

  // ——— смена города, не ломая текущий путь
  const handleCityChange = (slug: string) => {
    setCity(slug);
    setIsCityDropdownOpen(false);
    
    // Сохраняем выбранный город
    saveCurrentCity(slug);
    
    // Отправляем событие о смене города
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cityChanged'))
    }

    if (pathname.startsWith('/city/')) {
      const parts = pathname.split('/');
      parts[2] = slug;
      const next = parts.join('/') || '/';
      const qp = new URLSearchParams(sp.toString());
      qp.delete('city');
      router.push(qp.size ? `${next}?${qp.toString()}` : next);
      return;
    }

    const qp = new URLSearchParams(sp.toString());
    qp.set('city', slug);
    router.push(qp.size ? `${pathname}?${qp.toString()}` : pathname);
  };

  // ——— меню зависит от выбранного города
  const nav = useMemo(
    () => [
      { label: 'АФИША', href: `/city/${city}/cat/events` },
      { label: 'МЕСТА', href: `/city/${city}/cat/venues` },
      { label: 'ПРАЗДНИКИ', href: `/city/${city}/cat/parties` },
      { label: 'БЛОГ', href: `/blog` },
    ],
    [city]
  );

  const currentCity = cities.find(c => c.slug === city);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[99999] bg-gray-800 text-white" style={{ fontFamily: 'var(--font-unbounded)' }}>
        <div className="relative bg-yellow-400 text-black text-center py-2 overflow-hidden group">
          {/* Shimmer эффект */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
          
          {/* Hover эффект */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <h1 className="relative text-2xl font-bold transition-all duration-300 group-hover:scale-105" style={{ fontFamily: 'var(--font-unbounded)' }}>
            {getPageTitle(pathname, currentCity?.name || 'МОСКВА')}
          </h1>
        </div>
        <div className="bg-white text-black">
          <div className="w-full px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-8">
                <a href="/" className="text-red-600 text-2xl font-bold hover:text-red-700 transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}>Kiddeo</a>
            
            {/* City Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="bg-transparent text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-unbounded)' }}
                >
                  {currentCity?.name}
                  <svg 
                    className={`w-4 h-4 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* City Dropdown */}
                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl z-50 min-w-[600px] max-w-[800px] border border-gray-200 max-h-[400px] overflow-y-auto">
                    <div className="py-2">
                      <div className={`grid gap-1 px-2 ${
                        cities.length === 1 ? 'grid-cols-1' :
                        cities.length === 2 ? 'grid-cols-2' :
                        cities.length <= 6 ? 'grid-cols-2' :
                        'grid-cols-3'
                      }`}>
                        {cities.map((cityItem) => (
                          <button
                            key={cityItem.slug}
                            onClick={() => handleCityChange(cityItem.slug)}
                            className={`text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm ${unbounded.className} ${
                              cityItem.slug === city ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-700'
                            }`}
                          >
                            {cityItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <nav className="flex space-x-6">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                        className="hover:text-red-600 transition-colors" style={{ fontFamily: 'var(--font-unbounded)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Правая часть хедера: поиск, корзина, баллы, профиль */}
            <div className="flex items-center space-x-4">
                {/* Поиск */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {/* Корзина */}
                <CartButtonWithCounter />
                
                {/* Баллы */}
                <PointsWidget />
                
                {/* Профиль */}
                <AuthButton />
              </div>
            </div>
          </div>
      </header>
      
      {/* Toast Container - позиционируется под хедером */}
      <ToastContainer />
    </>
  );
}