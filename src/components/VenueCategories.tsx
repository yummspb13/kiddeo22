'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './VenueCategories.css';

interface VenueCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  subcategories: VenueSubcategory[];
}

interface VenueSubcategory {
  id: number;
  name: string;
  slug: string;
  backgroundImage?: string;
  isActive: boolean;
}

interface VenueCategoriesProps {
  citySlug?: string;
}

export default function VenueCategories({ citySlug = 'moscow' }: VenueCategoriesProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<VenueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('🔍 VENUE CATEGORIES: Fetching categories from API...');
      const response = await fetch('/api/venues/categories');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 VENUE CATEGORIES: API response:', data);
        setCategories(data);
        if (data.length > 0) {
          setActiveTab(data[0].name);
        }
      } else {
        console.error('🔍 VENUE CATEGORIES: API error:', response.status);
      }
    } catch (error) {
      console.error('🔍 VENUE CATEGORIES: Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategory: VenueSubcategory, category: VenueCategory) => {
    console.log('🔍 VENUE CATEGORIES: Navigating to subcategory:', {
      subcategory: subcategory.slug,
      category: category.slug,
      city: citySlug
    });
    router.push(`/city/${citySlug}/cat/${category.slug}/${subcategory.slug}`);
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Pill табы категорий */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.name)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center ${
                activeTab === category.name
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.icon && (
                <span className="mr-2">
                  {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-lg">{category.icon}</span>
                  )}
                </span>
              )}
              {category.name}
            </button>
          ))}
        </div>

        {/* Карточки подкатегорий */}
        {activeTab && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories
              .find(cat => cat.name === activeTab)
              ?.subcategories.map((subcategory) => {
                const category = categories.find(cat => cat.name === activeTab);
                return (
                  <SubcategoryCard 
                    key={subcategory.id} 
                    subcategory={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory, category!)}
                  />
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

// Компонент карточки подкатегории в стиле афиши
function SubcategoryCard({ subcategory, onClick }: { subcategory: VenueSubcategory; onClick: () => void }) {
  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32"
      onClick={onClick}
    >
      {/* Фоновое изображение */}
      <div className="absolute inset-0">
        {subcategory.backgroundImage ? (
          <>
            <img 
              src={subcategory.backgroundImage}
              alt={subcategory.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Если изображение не загрузилось, показываем градиент
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 hidden" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
      </div>

      {/* Контент */}
      <div className="relative z-10 h-full flex flex-col justify-center p-4">
        <div className="text-white">
          <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
            {subcategory.name}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-lg">
            Подкатегория
          </p>
        </div>
      </div>
    </div>
  );
}
