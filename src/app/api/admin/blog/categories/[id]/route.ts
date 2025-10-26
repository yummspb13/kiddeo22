import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET - Получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.contentCategory.findUnique({
      where: { id: parseInt(id) },
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
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      category: {
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
      }
    })
  } catch (error) {
    console.error('Error fetching blog category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog category' },
      { status: 500 }
    )
  }
}

// PUT - Обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      slug,
      description,
      color,
      sortOrder,
      isActive
    } = body

    // Проверяем, что категория существует
    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Проверяем, что название и slug уникальны (если изменились)
    if (name !== existingCategory.name || slug !== existingCategory.slug) {
      const duplicateCategory = await prisma.contentCategory.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                { name },
                { slug }
              ]
            }
          ]
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name or slug already exists' },
          { status: 400 }
        )
      }
    }

    // Обновляем категорию
    const category = await prisma.contentCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        color,
        sortOrder,
        isActive,
        updatedAt: new Date()
      },
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
      }
    })

    return NextResponse.json({
      success: true,
      category: {
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
      }
    })
  } catch (error) {
    console.error('Error updating blog category:', error)
    return NextResponse.json(
      { error: 'Failed to update blog category' },
      { status: 500 }
    )
  }
}

// DELETE - Удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем, что категория существует
    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            Content: {
              where: {
                type: 'blog'
              }
            }
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Проверяем, есть ли статьи в этой категории
    if (existingCategory._count.Content > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing blog posts. Please move or delete the posts first.' },
        { status: 400 }
      )
    }

    // Удаляем категорию
    await prisma.contentCategory.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog category' },
      { status: 500 }
    )
  }
}
