'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import LoginModal from './LoginModal'

interface BottomNavigationProps {
  citySlug?: string
}

const navigationItems = [
  {
    name: 'Главная',
    href: '/',
    icon: '/images/home.png',
    exact: true
  },
  {
    name: 'Афиша',
    href: '/moscow/events',
    icon: '/images/calendar.png',
    exact: false
  },
  {
    name: 'Места',
    href: '/city/moscow/cat/venues',
    icon: '/images/gps.png',
    exact: false
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: '/images/woman.png',
    exact: false
  }
]

export default function BottomNavigation({ citySlug = 'moscow' }: BottomNavigationProps) {
  const pathname = usePathname()
  const { isAuthenticated, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()

  // Update hrefs with current city
  const itemsWithCity = navigationItems.map(item => ({
    ...item,
    href: item.href.replace('moscow', citySlug)
  }))

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {itemsWithCity.map((item) => {
          const isItemActive = isActive(item.href, item.exact)
          
          // Special handling for profile - show modal if not authenticated
          if (item.name === 'Профиль' && !isAuthenticated) {
            return (
              <button
                key={item.name}
                onClick={openLoginModal}
                className={`
                  flex flex-col items-center justify-center min-h-touch min-w-touch px-2 py-1 rounded-lg transition-colors
                  ${isItemActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <div className="relative">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={`${isItemActive ? 'opacity-100' : 'opacity-70'}`}
                  />
                </div>
                <span className={`text-xs mt-1 font-medium ${isItemActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.name}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center min-h-touch min-w-touch px-2 py-1 rounded-lg transition-colors
                ${isItemActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <div className="relative">
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={20}
                  height={20}
                  className={`${isItemActive ? 'opacity-100' : 'opacity-70'}`}
                />
              </div>
              <span className={`text-xs mt-1 font-medium ${isItemActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </nav>
  )
}

// Hook for bottom navigation state
export function useBottomNavigation() {
  const pathname = usePathname()
  
  const isBottomNavVisible = () => {
    // Hide on certain pages
    const hiddenPages = [
      '/admin',
      '/vendor',
      '/content',
      '/auth',
      '/login',
      '/register'
    ]
    
    return !hiddenPages.some(page => pathname.startsWith(page))
  }

  return {
    isVisible: isBottomNavVisible()
  }
}