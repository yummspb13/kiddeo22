import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function SimpleEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Город
  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, isPublic: true },
  })
  if (!city || !city.isPublic) return notFound()

  // Простая загрузка событий
  const events = await prisma.afishaEvent.findMany({
    where: {
      status: 'active',
      city: city.name,
      endDate: { gte: new Date() } // Только будущие события
    },
    orderBy: { startDate: 'asc' },
    take: 20,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      startDate: true,
      endDate: true,
      coverImage: true,
      venue: true,
      isPaid: true,
      minPrice: true
    }
  })

  // Простая загрузка категорий
  const categories = await prisma.afishaCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  })

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-4">События в {city.name}</h1>
      
      {/* Категории */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* События */}
      <div>
        <h2 className="text-2xl font-bold mb-4">События ({events.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              {event.coverImage && (
                <img 
                  src={event.coverImage} 
                  alt={event.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{event.description}</p>
              <p className="text-sm text-gray-500">
                {(() => {
                  try {
                    const date = new Date(event.startDate)
                    if (Number.isNaN(date.getTime())) {
                      return 'Дата уточняется'
                    }
                    return date.toLocaleDateString('ru-RU')
                  } catch (error) {
                    return 'Дата уточняется'
                  }
                })()}
                {event.venue && ` • ${event.venue}`}
              </p>
              <p className="text-sm font-semibold mt-2">
                {event.isPaid ? `От ${event.minPrice || 0} ₽` : 'Бесплатно'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
