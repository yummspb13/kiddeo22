import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE - удалить из избранного
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const favoriteId = (await params).id
    const userIdInt = parseInt(userId)
    
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/profile/simple-favorites/[id] - UserId:', userId, 'FavoriteId:', favoriteId)

    // Сначала проверим, существует ли избранное
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId: userIdInt
      }
    })
    
    console.log('🔍 DELETE - Existing favorite found:', existingFavorite)

    if (!existingFavorite) {
      console.log('🔍 DELETE - Favorite not found, returning 404')
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    // Удаляем из базы данных
    const deleted = await prisma.favorite.deleteMany({
      where: {
        id: favoriteId,
        userId: userIdInt
      }
    })
    
    console.log('🔍 DELETE - Deleted count:', deleted.count)
    
    if (deleted.count > 0) {
      return NextResponse.json({ message: 'Favorite removed successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}