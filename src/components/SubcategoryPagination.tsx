'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalItems: number
  itemsPerPage?: number
  currentPage?: number
}

export default function SubcategoryPagination({ 
  totalItems, 
  itemsPerPage = 6, 
  currentPage = 1 
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    router.push(`?${queryString}`, { scroll: false })
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  if (totalPages <= 1) {
    return (
      <div className="text-center mt-4 text-sm text-gray-600">
        Показано {totalItems} из {totalItems} мест
      </div>
    )
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              i === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        )
      }
    } else {
      // Показываем с многоточием
      if (currentPage <= 3) {
        // Начало: 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                i === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i}
            </button>
          )
        }
        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>)
        pages.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        )
      } else if (currentPage >= totalPages - 2) {
        // Конец: 1, ..., last-3, last-2, last-1, last
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            1
          </button>
        )
        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>)
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                i === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i}
            </button>
          )
        }
      } else {
        // Середина: 1, ..., current-1, current, current+1, ..., last
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            1
          </button>
        )
        pages.push(<span key="ellipsis3" className="px-2 text-gray-500">...</span>)
        
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                i === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i}
            </button>
          )
        }
        
        pages.push(<span key="ellipsis4" className="px-2 text-gray-500">...</span>)
        pages.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        )
      }
    }
    
    return pages
  }

  return (
    <section className="mb-8">
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Предыдущая
          </button>
          
          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>
          
          <button 
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Следующая →
          </button>
        </div>
      </div>
      
      <div className="text-center mt-4 text-sm text-gray-600">
        Показано {startItem}-{endItem} из {totalItems} мест
      </div>
    </section>
  )
}
