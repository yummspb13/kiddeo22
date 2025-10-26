// src/app/city/[slug]/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CityPage({
  params,
}: {
  params: { slug: string }
}) {
  const city = await prisma.city.findUnique({ where: { slug: params.slug } })
  if (!city || !city.isPublic) return notFound()

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

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
