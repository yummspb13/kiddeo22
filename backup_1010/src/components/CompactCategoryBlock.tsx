"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation"
import { 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react"

interface CompactCategoryBlockProps {
  citySlug: string
}

const categories = [
  {
    id: 'master-classes',
    name: 'Мастер-классы',
    emoji: '🎨',
    description: 'Арт-студии, лепка, творческие классы',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    subcategories: [
      { name: 'Арт-студии', count: 12, popular: true },
      { name: 'Лепка и керамика', count: 8, popular: false },
      { name: 'Рисование', count: 15, popular: true },
      { name: 'Рукоделие', count: 6, popular: false },
      { name: 'Музыкальные классы', count: 9, popular: false }
    ]
  },
  {
    id: 'leisure',
    name: 'Прочий досуг',
    emoji: '🧸',
    description: 'Зоопарки, театры, аквапарки, фермы',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    subcategories: [
      { name: 'Зоопарки', count: 5, popular: true },
      { name: 'Театры', count: 8, popular: true },
      { name: 'Аквапарки', count: 3, popular: false },
      { name: 'Фермы', count: 7, popular: false },
      { name: 'Музеи', count: 12, popular: true }
    ]
  },
  {
    id: 'sports',
    name: 'Спорт',
    emoji: '⚽️',
    description: 'Спортшколы, секции, бассейны',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    subcategories: [
      { name: 'Футбол', count: 18, popular: true },
      { name: 'Плавание', count: 14, popular: true },
      { name: 'Теннис', count: 7, popular: false },
      { name: 'Гимнастика', count: 11, popular: true },
      { name: 'Боевые искусства', count: 9, popular: false }
    ]
  },
  {
    id: 'education',
    name: 'Образование',
    emoji: '📚',
    description: 'Детсады, школы, подготовка, онлайн-курсы',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    subcategories: [
      { name: 'Детские сады', count: 25, popular: true },
      { name: 'Подготовка к школе', count: 16, popular: true },
      { name: 'Иностранные языки', count: 13, popular: true },
      { name: 'Онлайн-курсы', count: 8, popular: false },
      { name: 'Репетиторы', count: 20, popular: true }
    ]
  },
  {
    id: 'medicine',
    name: 'Медицина',
    emoji: '🩺',
    description: 'Логопеды, детские психологи, офтальмологи',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    subcategories: [
      { name: 'Логопеды', count: 22, popular: true },
      { name: 'Детские психологи', count: 15, popular: true },
      { name: 'Офтальмологи', count: 8, popular: false },
      { name: 'Стоматологи', count: 12, popular: true },
      { name: 'Массажисты', count: 6, popular: false }
    ]
  },
  {
    id: 'camps',
    name: 'Лагеря',
    emoji: '🏕',
    description: 'Городские и загородные, с уклоном (спорт/арт)',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    subcategories: [
      { name: 'Городские лагеря', count: 10, popular: true },
      { name: 'Загородные лагеря', count: 7, popular: true },
      { name: 'Спортивные лагеря', count: 5, popular: false },
      { name: 'Творческие лагеря', count: 8, popular: true },
      { name: 'Языковые лагеря', count: 4, popular: false }
    ]
  },
  {
    id: 'nannies',
    name: 'Няни',
    emoji: '👩‍🍼',
    description: 'Агентства, частные профили',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    subcategories: [
      { name: 'Агентства нянь', count: 15, popular: true },
      { name: 'Частные няни', count: 28, popular: true },
      { name: 'Гувернантки', count: 9, popular: false },
      { name: 'Няни с проживанием', count: 6, popular: false },
      { name: 'Временные няни', count: 12, popular: true }
    ]
  }
]

export default function CompactCategoryBlock({ citySlug }: CompactCategoryBlockProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const router = useRouter()

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
    }
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryName: string) => {
    router.push(`/city/${citySlug}/cat/venues/${categoryId}?subcategory=${subcategoryName}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Категории мест</h3>
            <p className="text-sm text-gray-600">Выберите интересующую категорию</p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Card */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full h-32 p-4 rounded-xl border-2 transition-all duration-300 flex flex-col justify-center items-center ${category.bgColor} ${category.borderColor} hover:shadow-md`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {category.emoji.startsWith('http') ? (
                      <img
                        src={category.emoji}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="object-contain mx-auto category-icon"
                        style={{ 
                          backgroundColor: 'transparent',
                          background: 'transparent',
                          mixBlendMode: 'normal'
                        }}
                      />
                    ) : (
                      category.emoji
                    )}
                  </div>
                  <h4 className={`font-semibold text-sm mb-1 line-clamp-1 ${category.textColor}`}>
                    {category.name}
                  </h4>
                  <p className="text-xs opacity-80 line-clamp-2 text-gray-600">
                    {category.description}
                  </p>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="transition-transform duration-300">
                    {expandedCategory === category.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown */}
              {expandedCategory === category.id && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <h5 className={`font-semibold ${category.textColor}`}>
                          {category.name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {category.subcategories.length} подкатегорий
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubcategoryClick(category.id, subcategory.name)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {subcategory.name}
                              </span>
                              {subcategory.popular && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-yellow-600 font-medium">Популярное</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {subcategory.count}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* View All Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/city/${citySlug}/cat/venues/${category.id}`)}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${category.bgColor} ${category.textColor} hover:opacity-90 transition-opacity font-medium text-sm`}
                      >
                        <span>Все в категории</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">150+</div>
            <div className="text-sm text-gray-600">Мест всего</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">Категорий</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">35+</div>
            <div className="text-sm text-gray-600">Подкатегорий</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">4.8</div>
            <div className="text-sm text-gray-600">Средний рейтинг</div>
          </div>
        </div>
      </div>
    </div>
  )
}