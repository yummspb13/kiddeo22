import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        _count: {
          select: { eventCollections: true }
        }
      }
    })

    return NextResponse.json(collections)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, coverImage, city, citySlug, order, isActive, hideFromAfisha } = body

    // Проверяем, что slug уникален
    const existingCollection = await prisma.collection.findUnique({
      where: { slug }
    })

    if (existingCollection) {
      return NextResponse.json({ error: 'Collection with this slug already exists' }, { status: 400 })
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        slug,
        description,
        coverImage,
        city,
        citySlug,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        hideFromAfisha: hideFromAfisha !== undefined ? hideFromAfisha : false
      },
      include: {
        _count: {
          select: { eventCollections: true }
        }
      }
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}
