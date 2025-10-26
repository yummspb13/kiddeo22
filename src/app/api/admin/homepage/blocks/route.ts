import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

const BLOCK_TYPES = [
  'POPULAR_EVENTS',
  'POPULAR_VENUES', 
  'POPULAR_SERVICES',
  'CATEGORIES',
  'COLLECTIONS',
  'RECOMMENDED',
  'NEW_IN_CATALOG',
  'BLOG_POSTS'
] as const

type BlockType = typeof BLOCK_TYPES[number]

// GET - получить все блоки для города
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('citySlug') || 'moscow'
    
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: searchParams.get('key') }) })

    const blocks = await prisma.homePageBlock.findMany({
      where: { citySlug },
      orderBy: { order: 'asc' }
    })

    // Если блоков нет, создаем дефолтные
    if (blocks.length === 0) {
      const defaultBlocks = BLOCK_TYPES.map((blockType, index) => ({
        blockType,
        citySlug,
        isVisible: true,
        order: index,
        customTitle: null,
        customDescription: null
      }))

      await prisma.homePageBlock.createMany({
        data: defaultBlocks
      })

      const newBlocks = await prisma.homePageBlock.findMany({
        where: { citySlug },
        orderBy: { order: 'asc' }
      })

      return NextResponse.json(newBlocks)
    }

    return NextResponse.json(blocks)
  } catch (error) {
    console.error('Error fetching homepage blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage blocks' },
      { status: 500 }
    )
  }
}

// POST - создать конфигурацию блока
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: new URL(request.url).searchParams.get('key') }) })

    const body = await request.json()
    const { blockType, citySlug, isVisible = true, order = 0, customTitle, customDescription } = body

    if (!BLOCK_TYPES.includes(blockType)) {
      return NextResponse.json(
        { error: 'Invalid block type' },
        { status: 400 }
      )
    }

    const block = await prisma.homePageBlock.create({
      data: {
        blockType,
        citySlug,
        isVisible,
        order,
        customTitle,
        customDescription
      }
    })

    return NextResponse.json(block)
  } catch (error) {
    console.error('Error creating homepage block:', error)
    return NextResponse.json(
      { error: 'Failed to create homepage block' },
      { status: 500 }
    )
  }
}

// PATCH - обновить видимость/порядок блоков
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: new URL(request.url).searchParams.get('key') }) })

    const body = await request.json()
    const { updates } = body // Array of { id, isVisible?, order? }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      )
    }

    // Обновляем блоки в транзакции
    const results = await prisma.$transaction(
      updates.map((update: any) =>
        prisma.homePageBlock.update({
          where: { id: update.id },
          data: {
            ...(update.isVisible !== undefined && { isVisible: update.isVisible }),
            ...(update.order !== undefined && { order: update.order }),
            ...(update.customTitle !== undefined && { customTitle: update.customTitle }),
            ...(update.customDescription !== undefined && { customDescription: update.customDescription }),
            ...(update.citySlug !== undefined && { citySlug: update.citySlug })
          }
        })
      )
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error updating homepage blocks:', error)
    return NextResponse.json(
      { error: 'Failed to update homepage blocks' },
      { status: 500 }
    )
  }
}
