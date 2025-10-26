import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.afishaCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Creating category:', body)

    const category = await prisma.afishaCategory.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description || null,
        icon: body.icon || null,
        coverImage: body.coverImage || null,
        color: body.color || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        sortOrder: body.sortOrder || 0
      }
    })

    console.log('✅ Category created:', category.id)

    return NextResponse.json({ 
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        coverImage: category.coverImage,
        color: category.color,
        isActive: category.isActive,
        sortOrder: category.sortOrder
      }
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}