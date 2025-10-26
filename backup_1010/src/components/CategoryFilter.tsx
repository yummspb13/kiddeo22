'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categoryStats: Array<{ category: string | null; count: number }>
}

export default function CategoryFilter({ categoryStats }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string, checked: boolean) => {
    const url = new URL(window.location.href)
    const categoriesParam = url.searchParams.get('categories')
    const currentCategories: string[] = categoriesParam ? categoriesParam.split(',') : []
    
    let newCategories: string[]
    if (checked) {
      newCategories = [...currentCategories, category]
    } else {
      newCategories = currentCategories.filter(c => c !== category)
    }
    
    if (newCategories.length > 0) {
      url.searchParams.set('categories', newCategories.join(','))
    } else {
      url.searchParams.delete('categories')
    }
    
    // НЕ сбрасываем пагинацию для фильтра по категориям
    router.push(url.pathname + url.search, { scroll: false })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Категории</h3>
      <div className="space-y-2">
        {categoryStats.map(({ category, count }) => {
          if (!category) return null
          
          const currentCategories = searchParams.get('categories')?.split(',') || []
          const isChecked = currentCategories.includes(category)
          
          return (
            <label key={category} className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={isChecked}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
              />
              <span>{category} ({count})</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
