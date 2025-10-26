'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Menu, Search, X } from 'lucide-react';
import AuthButton from './AuthButton';
import MobileAuthButton from './MobileAuthButton';
import { CartButtonWithCounter } from './CartButtonWithCounter';
import { ToastContainer } from './Toast';
import PointsWidget from './PointsWidget';
import MobileDrawer from './MobileDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { saveCurrentCity, getCurrentCity } from '@/utils/cookies';
import LoginModal from './LoginModal';
import SearchAutocomplete from './SearchAutocomplete';
import { getCityPrepositionOnly } from '@/lib/declension';
// Убираем импорт шрифта, используем CSS переменную напрямую;

type City = { slug: string; name: string };
type Props = { cities: City[] };

export default function Header({ cities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  
  // Проверяем авторизацию для страниц профиля
  const { user: session, openLoginModal, isLoginModalOpen, closeLoginModal } = useAuth();


  // ——— текущий город из пути, query, localStorage
  const urlCity = sp?.get('city') ?? undefined;
  
  // Извлекаем город из разных типов URL
  let pathCity: string | undefined;
  if (pathname?.startsWith('/city/')) {
    // Для /city/[slug]/... - берем slug из пути
    pathCity = pathname.split('/')[2] || undefined;
  } else if (pathname?.match(/^\/[^\/]+\/events/)) {
    // Для /[city]/events - берем city из пути
    pathCity = pathname.split('/')[1] || undefined;
  }
  
  const savedCity = typeof window !== 'undefined' ? getCurrentCity() : 'moscow';
  
  // Приоритет: путь > query > сохраненный город
  const initialCity = pathCity ?? urlCity ?? savedCity;

  const [city, setCity] = useState(initialCity);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileCityDropdownOpen, setIsMobileCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обработка поиска
  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Перенаправляем на страницу поиска с параметрами
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}&city=${city}`;
      router.push(searchUrl);
    }
    setIsSearchOpen(false);
  };
  useEffect(() => setCity(initialCity), [initialCity]);

  // Обработка параметра login=true для открытия модалки входа
  useEffect(() => {
    if (sp?.get('login') === 'true' && !session) {
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
    return `ДЕТСКИЕ РАЗВЛЕЧЕНИЯ ${getCityPrepositionOnly(cityName)}`;
  };

  // ——— функция для получения заголовка с переносом для мобильных
  const getPageTitleWithBreak = (path: string, cityName: string) => {
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
    // Главная страница или другие страницы - с переносом для мобильных
    const cityPreposition = getCityPrepositionOnly(cityName);
    return (
      <>
        <span className="block md:inline">ДЕТСКИЕ РАЗВЛЕЧЕНИЯ</span>
        <span className="block md:inline"> {cityPreposition}</span>
      </>
    );
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

    // Обработка разных типов URL
    if (pathname?.startsWith('/city/')) {
      // Для /city/[slug]/... - меняем slug в пути
      const parts = pathname.split('/');
      parts[2] = slug;
      const next = parts.join('/') || '/';
      const qp = new URLSearchParams(sp?.toString() || '');
      qp.delete('city'); // Удаляем city из query параметров
      router.push(qp.size ? `${next}?${qp.toString()}` : next);
      return;
    }

    // Для /[city]/events - меняем city в пути
    if (pathname?.match(/^\/[^\/]+\/events/)) {
      const next = `/${slug}/events`;
      const qp = new URLSearchParams(sp?.toString() || '');
      qp.delete('city'); // Удаляем city из query параметров
      router.push(qp.size ? `${next}?${qp.toString()}` : next);
      return;
    }

    // Для остальных случаев - добавляем city в query параметры
    const qp = new URLSearchParams(sp?.toString() || '');
    qp.set('city', slug);
    router.push(qp.size ? `${pathname ?? ''}?${qp.toString()}` : pathname ?? '');
  };

  // ——— меню зависит от выбранного города
  const nav = useMemo(
    () => [
      { label: 'АФИША', href: `/${city}/events` },
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
            {getPageTitleWithBreak(pathname ?? '', currentCity?.name || 'МОСКВА')}
          </h1>
        </div>
        <div className="bg-white text-black">
          <div className="w-full px-4 py-4 flex items-center justify-between">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
                <img
                  src="/images/logo_kiddeo.png"
                  alt="Kiddeo"
                  className="h-10 w-auto"
                />
              </Link>
          
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
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl z-50 w-80 sm:w-96 md:min-w-[600px] md:max-w-[800px] border border-gray-200 max-h-[400px] overflow-y-auto">
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
                            className={`text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm ${
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
                  <div key={item.href} className="relative">
                    {item.label === 'ПРАЗДНИКИ' && (
                      <div className="absolute -bottom-2 -right-2 transform rotate-[-5deg]">
                        <span className="text-red-500 text-xs font-bold whitespace-nowrap soon-text" style={{ fontFamily: 'var(--font-unbounded)' }}>
                          Скоро
                        </span>
                      </div>
                    )}
                    <Link
                      href={item.href}
                      className="hover:text-red-600 transition-colors" style={{ fontFamily: 'var(--font-unbounded)' }}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
            
            {/* Mobile Layout */}
            <div className="md:hidden flex items-center justify-between w-full">
              {/* Logo */}
              <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center">
                <img
                  src="/images/logo_kiddeo.png"
                  alt="Kiddeo"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Mobile Actions */}
              <div className="flex items-center space-x-2">
                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search size={20} />
                </button>
                
                {/* Cart */}
                <CartButtonWithCounter />
                
                {/* User Avatar */}
                <MobileAuthButton />
                
                {/* Menu */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
            
            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>
              
              {/* Cart */}
              <CartButtonWithCounter />
              
              {/* Points */}
              <PointsWidget />
              
              {/* Profile */}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Меню"
        position="right"
        size="md"
      >
        <div className="p-4 space-y-6" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Разделы</h3>
            <nav className="space-y-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span style={{ fontFamily: 'var(--font-unbounded)' }}>
                    {item.label}
                  </span>
                  {item.label === 'ПРАЗДНИКИ' && (
                    <span className="text-red-500 text-xs font-bold soon-text">
                      Скоро
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* City Selector for Mobile */}
          <div>
            <button
              onClick={() => setIsMobileCityDropdownOpen(!isMobileCityDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-500">Город</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">
                  {currentCity?.name || 'Москва'}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isMobileCityDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {/* City Dropdown */}
            {isMobileCityDropdownOpen && (
              <div className="mt-2 pl-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                  {cities.map((cityItem) => (
                    <button
                      key={cityItem.slug}
                      onClick={() => {
                        handleCityChange(cityItem.slug)
                        setIsMobileCityDropdownOpen(false)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`text-left px-2 py-1.5 rounded-md transition-colors text-xs ${
                        cityItem.slug === city 
                          ? 'bg-red-50 text-red-600 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cityItem.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </MobileDrawer>

      {/* Search Drawer */}
      <MobileDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Поиск"
        position="bottom"
        size="sm"
      >
        <div className="p-4">
          <SearchAutocomplete 
            citySlug={city} 
            onSearch={handleSearch}
          />
        </div>
      </MobileDrawer>
      
      {/* Toast Container - позиционируется под хедером */}
      <ToastContainer />
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}