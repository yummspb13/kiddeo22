import { unstable_cache } from 'next/cache'

// Кеширование для высоконагруженных страниц
export const getCachedEvents = unstable_cache(
  async (citySlug: string, categorySlug?: string, filters?: unknown) => {
    // Здесь будет логика получения событий из базы данных
    // Для демо возвращаем пустой массив
    return []
  },
  ['events'],
  {
    tags: ['events'],
    revalidate: 300 // 5 минут
  }
)

export const getCachedEvent = unstable_cache(
  async (eventId: string) => {
    // Здесь будет логика получения конкретного события
    return null
  },
  ['event'],
  {
    tags: ['events'],
    revalidate: 600 // 10 минут
  }
)

export const getCachedCities = unstable_cache(
  async () => {
    const { prisma } = await import('./db');
    
    try {
      const cities = await prisma.city.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          slug: true,
          name: true,
          isPublic: true
        },
        orderBy: { name: 'asc' }
      });
      
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },
  ['cities'],
  {
    tags: ['cities'],
    revalidate: 3600 // 1 час
  }
)

// Функция для инвалидации кеша
export async function revalidateEvents() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('events')
}

export async function revalidateEvent(eventId: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('events')
  revalidateTag(`event-${eventId}`)
}
