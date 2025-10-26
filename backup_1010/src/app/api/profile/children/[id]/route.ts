import { NextRequest, NextResponse } from 'next/server'
import { getToken } from "@/lib/auth-utils"
import { prisma } from '@/lib/db'

// PUT - редактировать ребенка
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(request)
    
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, birthDate, gender } = await request.json()
    const childId = parseInt((await params).id)
    const userId = parseInt(token.sub)

    // Проверяем, что ребенок принадлежит пользователю
    const existingChild = await prisma.userChild.findFirst({
      where: { 
        id: childId,
        userId: userId
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
        gender: gender
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
    const token = await getToken(request)
    
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const childId = parseInt((await params).id)
    const userId = parseInt(token.sub)

    // Проверяем, что ребенок принадлежит пользователю
    const existingChild = await prisma.userChild.findFirst({
      where: { 
        id: childId,
        userId: userId
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
