import { prisma } from '@/lib/db'
import BlogCategoriesClient from './BlogCategoriesClient'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BlogCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  try {
    // Получаем все категории блога
    const categories = await prisma.contentCategory.findMany({
      include: {
        _count: {
          select: {
            Content: {
              where: {
                type: 'blog',
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      postCount: category._count.Content,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Категории блога</h1>
            <p className="text-sm text-gray-600">Управление категориями для статей блога</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href={`/admin/blog?key=${k}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад в Блог
            </Link>
          </div>
        </div>

        <BlogCategoriesClient initialCategories={formattedCategories} />
      </div>
    )
  } catch (error) {
    console.error('Error loading blog categories:', error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Категории блога</h1>
            <p className="text-sm text-gray-600">Управление категориями для статей блога</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href={`/admin/blog?key=${k}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад в Блог
            </Link>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Ошибка загрузки категорий. Попробуйте обновить страницу.</p>
        </div>
      </div>
    )
  }
}
