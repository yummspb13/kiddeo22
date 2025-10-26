'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import SmartSearch from './SmartSearch';

type City = { slug: string; name: string };

export default function Hero({ 
  cityName, 
  citySlug, 
  cities = [] 
}: { 
  cityName: string; 
  citySlug: string;
  cities?: City[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCityChange = (newCitySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', newCitySlug);
    router.push(`/?${params.toString()}`);
    setIsCityDropdownOpen(false);
  };

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
    <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 font-unbounded">
          Все для семьи с детьми
        </h1>
        <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
          Единая платформа с мероприятиями, услугами и местами в вашем городе — 
          <span className="relative inline-block ml-2" ref={dropdownRef}>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold font-unbounded"
            >
              {cityName} ▼
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
                    {cities.map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => handleCityChange(city.slug)}
                        className={`text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm ${
                          city.slug === citySlug ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </span>
        </p>
        
        {/* Smart Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <SmartSearch selectedCity={citySlug} />
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href={`/${citySlug}/events`}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium"
          >
            🎭 Афиша
          </Link>
          <Link 
            href={`/city/${citySlug}/cat/venues`}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium"
          >
            🏰 Места
          </Link>
          <Link 
            href={`/city/${citySlug}/cat/parties`}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium"
          >
            🎉 Праздники
          </Link>
          <Link 
            href="/blog"
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium"
          >
            📝 Блог
          </Link>
        </div>
      </div>
    </section>
  );
}
