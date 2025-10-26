import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export default async function NewListingPage() {
  console.log('🔍 NEW LISTING PAGE: Starting page load')
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session = null
  if (sessionCookie) {
    try {
      console.log('🔍 NEW LISTING PAGE: Session cookie found, calling getServerSession...')
      
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      session = await getServerSession(mockRequest)
      console.log('🔍 NEW LISTING PAGE: getServerSession result:', session)
    } catch (error) {
      console.log('🔍 NEW LISTING PAGE: getServerSession error:', error)
      session = null
    }
  } else {
    console.log('🔍 NEW LISTING PAGE: No session cookie found')
  }
  
  console.log('🔍 NEW LISTING PAGE: Session check', { hasSession: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('🔍 NEW LISTING PAGE: No session, redirecting to login')
    redirect('/?login=true')
  }

  // Проверяем, что пользователь является вендором
  const vendor = await prisma.vendor.findUnique({
    where: { userId: parseInt(session.user.id) }
  })

  if (!vendor) {
    redirect('/vendor/onboarding')
  }

  // Получаем подкатегории для мест
  const subcategories = await prisma.venueSubcategory.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  // Получаем города
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className={`min-h-screen bg-gray-50 font-unbounded ${unbounded.variable}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-unbounded">
              Создать новое место
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-unbounded">
              Выберите тип места, которое хотите добавить
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Место */}
              <a
                href="/vendor/venues/create"
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">
                    Место
                  </h3>
                  <p className="text-gray-600 mb-4 font-unbounded">
                    Парки, музеи, рестораны, развлекательные центры
                  </p>
                  <div className="text-sm text-blue-600 font-medium font-unbounded">
                    Создать место →
                  </div>
                </div>
              </a>

              {/* Услуга */}
              <a
                href="/vendor/services/create"
                className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">
                    Услуга
                  </h3>
                  <p className="text-gray-600 mb-4 font-unbounded">
                    Образовательные курсы, мастер-классы, консультации
                  </p>
                  <div className="text-sm text-green-600 font-medium font-unbounded">
                    Создать услугу →
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>После создания место будет отправлено на модерацию</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
