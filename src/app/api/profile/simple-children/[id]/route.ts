import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  createApiResponse, 
  createApiError, 
  getRouteParams,
  safeParseInt,
  safePrismaOperation
} from '@/lib/api-utils'

export const runtime = 'nodejs'

// PUT - редактировать ребенка
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return createApiError('User ID required', 400)
    }

    const { name, birthDate, gender } = await request.json()
    const childId = parseInt((await params).id)
    const userIdInt = parseInt(userId)
    
    if (isNaN(userIdInt)) {
      return createApiError('Invalid User ID', 400)
    }
    
    if (isNaN(childId)) {
      return createApiError('Invalid Child ID', 400)
    }
    
    // TypeScript guard для userId
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type', 400)
    }
    
    // TypeScript guard для childId
    if (typeof (await params).id !== 'string') {
      return createApiError('Invalid Child ID type', 400)
    }
    
    // TypeScript guard для userId в where
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in where', 400)
    }
    
    // TypeScript guard для userId в update
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in update', 400)
    }
    
    // TypeScript guard для userId в delete
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in delete', 400)
    }
    
    // TypeScript guard для userId в where clause
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in where clause', 400)
    }
    
    // TypeScript guard для userId в where clause 2
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in where clause 2', 400)
    }
    
    // TypeScript guard для userId в where clause 3
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in where clause 3', 400)
    }
    
    // TypeScript guard для userId в where clause 4
    if (typeof userId !== 'string') {
      return createApiError('Invalid User ID type in where clause 4', 400)
    }

    console.log('🔍 PUT /api/profile/simple-children/[id] - UserId:', userId, 'ChildId:', childId, 'Data:', { name, birthDate, gender })

    // Проверяем, что ребенок принадлежит пользователю
    const existingChild = await prisma.userChild.findFirst({
      where: { 
        id: childId,
        userId: userIdInt
      }
    })

    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const child = await prisma.userChild.update({
      where: { id: childId },
      data: {
        name: name?.trim(),
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender: gender || 'unknown',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ child })
  } catch (error) {
    console.error('Error updating child:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить ребенка
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return createApiError('User ID required', 400)
    }

    const childId = parseInt((await params).id)
    const userIdInt = parseInt(userId)

    console.log('🔍 DELETE /api/profile/simple-children/[id] - UserId:', userId, 'ChildId:', childId)

    // Проверяем, что ребенок принадлежит пользователю
    const existingChild = await prisma.userChild.findFirst({
      where: { 
        id: childId,
        userId: userIdInt
      }
    })

    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    await prisma.userChild.delete({
      where: { id: childId }
    })

    return NextResponse.json({ message: 'Child deleted successfully' })
  } catch (error) {
    console.error('Error deleting child:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
