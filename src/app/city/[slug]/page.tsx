// src/app/city/[slug]/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'

// Убираем force-dynamic для лучшего кеширования
// export const dynamic = 'force-dynamic'

// Кешируем данные города
const getCachedCityData = unstable_cache(
  async (slug: string) => {
    console.log(`🔍 Loading city data for: ${slug}`)
    const startTime = Date.now()
    
    const city = await prisma.city.findUnique({ 
      where: { slug },
      select: { id: true, name: true, slug: true, isPublic: true }
    })
    
    if (!city || !city.isPublic) return null
    
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true }
    })
    
    const loadTime = Date.now() - startTime
    console.log(`✅ City data loaded for ${slug} in ${loadTime}ms, categories: ${categories.length}`)
    
    return { city, categories }
  },
  ['city-data'],
  {
    tags: ['cities', 'categories'],
    revalidate: 3600 // 1 час
  }
)

export default async function CityPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getCachedCityData(params.slug)
  if (!data) return notFound()
  
  const { city, categories } = data

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>{city.name}</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Выберите категорию, чтобы продолжить.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/city/${city.slug}/cat/${cat.slug}`}
            style={{
              display: 'block',
              padding: '14px 16px',
              border: '1px solid #eee',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            <div style={{ fontWeight: 600 }}>{cat.name}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>/cat/{cat.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
