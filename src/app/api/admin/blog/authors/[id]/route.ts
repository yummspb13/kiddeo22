import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            Content_Content_authorIdToUser: {
              where: {
                type: 'blog',
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name || 'Без имени',
        email: author.email,
        image: author.image,
        bio: author.bio,
        heroImage: author.heroImage,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
        postCount: author._count.Content_Content_authorIdToUser
      }
    })
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      email,
      image,
      bio,
      heroImage
    } = body

    // Проверяем, что автор существует
    const existingAuthor = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingAuthor) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    // Проверяем, что email уникален (если изменился)
    if (existingAuthor.email !== email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Обновляем автора
    const author = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        image,
        bio: bio || null,
        heroImage: heroImage || null,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            Content_Content_authorIdToUser: {
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
      author: {
        id: author.id,
        name: author.name || 'Без имени',
        email: author.email,
        image: author.image,
        bio: author.bio,
        heroImage: author.heroImage,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
        postCount: author._count.Content_Content_authorIdToUser
      }
    })
  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json(
      { error: 'Failed to update author' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем, что автор существует
    const existingAuthor = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            Content_Content_authorIdToUser: true
          }
        }
      }
    })

    if (!existingAuthor) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    // Проверяем, есть ли у автора статьи
    if (existingAuthor._count.Content_Content_authorIdToUser > 0) {
      return NextResponse.json(
        { error: 'Cannot delete author with existing articles. Please reassign or delete articles first.' },
        { status: 400 }
      )
    }

    // Удаляем автора
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    )
  }
}
