'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface Category {
  name: string
  slug: string
  description?: string
  icon?: string
  coverImage?: string
  color?: string
  count: number
}

interface InteractiveCategoriesProps {
  categories: Category[]
}

export default function InteractiveCategories({ categories }: InteractiveCategoriesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryClick = (categorySlug: string) => {
    const url = new URL(window.location.href)
    const categoriesParam = url.searchParams.get('categories')
    const currentCategories: string[] = categoriesParam ? categoriesParam.split(',') : []
    
    // Если категория уже выбрана, убираем её
    if (currentCategories.includes(categorySlug)) {
      const newCategories = currentCategories.filter(c => c !== categorySlug)
      if (newCategories.length > 0) {
        url.searchParams.set('categories', newCategories.join(','))
      } else {
        url.searchParams.delete('categories')
      }
    } else {
      // Добавляем категорию
      currentCategories.push(categorySlug)
      url.searchParams.set('categories', currentCategories.join(','))
    }
    
    url.searchParams.delete('page')
    router.push(url.pathname + url.search, { scroll: false })
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      'Театральные представления': '🎭',
      'Мастер-классы': '🎨',
      'Спорт': '⚽',
      'Образование': '📚',
      'Музыка': '🎵',
      'Развлечения': '🎪',
      'Наука': '🔬',
      'Экскурсии': '🗺️',
      'Праздники': '🎉',
      'Творчество': '✏️'
    }
    return iconMap[categoryName] || '🎯'
  }

  const getDefaultCoverImage = (categoryName: string) => {
    const coverMap: Record<string, string> = {
      'Театральные представления': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Мастер-классы': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Спорт': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Образование': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Музыка': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Развлечения': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
    return coverMap[categoryName] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  }

  const currentCategories = searchParams.get('categories')?.split(',') || []

  // Сортируем категории по количеству событий (убывание)
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count)

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-lg">🎭</span>
        </div>
        <h2 className="text-3xl font-bold font-unbounded">Категории событий</h2>
      </div>
      <p className="text-gray-600 mb-8 font-unbounded">Выберите интересующую вас категорию</p>
      
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
        {sortedCategories.map((category, index) => {
          const isSelected = currentCategories.includes(category.slug)
          const coverImage = category.coverImage || getDefaultCoverImage(category.name)
          const icon = category.icon || getCategoryIcon(category.name)
          
          // Определяем размер карточки на основе позиции
          const isLarge = index === 0 || index === 5 // Первая и шестая карточки большие
          const isMedium = index === 1 || index === 3 // Вторая и четвертая карточки средние
          
          return (
            <div 
              key={category.slug}
              className={`relative text-white p-4 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isSelected ? 'ring-4 ring-red-500 ring-opacity-50' : ''
              } ${isLarge ? 'p-6' : 'p-4'}`}
              style={{
                backgroundImage: `url("${coverImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              {isSelected && (
                <div className="absolute top-2 right-2 z-20">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="relative z-10">
                <div className={`mb-2 ${isLarge ? 'text-4xl' : isMedium ? 'text-3xl' : 'text-2xl'}`}>
                  {icon.startsWith('http') ? (
                    <img
                      src={icon}
                      alt={category.name}
                      width={isLarge ? 62 : isMedium ? 47 : 31}
                      height={isLarge ? 62 : isMedium ? 47 : 31}
                      className="object-contain category-icon"
                      style={{ 
                        backgroundColor: 'transparent',
                        background: 'transparent',
                        mixBlendMode: 'normal'
                      }}
                    />
                  ) : (
                    icon
                  )}
                </div>
                <h4 className={`font-bold mb-1 font-unbounded ${isLarge ? 'text-xl' : isMedium ? 'text-lg' : 'text-base'}`}>
                  {category.name}
                </h4>
                {category.description && (isLarge || isMedium) && (
                  <p className="text-white/90 mb-3 font-unbounded text-sm">
                    {category.description}
                  </p>
                )}
                <div className={`bg-white/20 px-2 py-1 rounded-full inline-block font-unbounded ${
                  isLarge ? 'text-sm px-3' : 'text-xs'
                }`} style={{ marginLeft: '-30px' }}>
                  {category.count} событий
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
