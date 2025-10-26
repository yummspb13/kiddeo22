import { NextRequest, NextResponse } from 'next/server'
import { removeFavorite } from '@/lib/favorites-persistent'

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
    const favoriteIdInt = parseInt(favoriteId)
    
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }
    
    if (isNaN(favoriteIdInt)) {
      return NextResponse.json({ error: 'Invalid Favorite ID' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type' }, { status: 400 })
    }
    
    // TypeScript guard для userId
    if (typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid User ID type' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite' }, { status: 400 })
    }
    
    // TypeScript guard для userId в removeFavorite
    if (typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid User ID type in removeFavorite' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite call
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite call' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite function call
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite function call' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite function call 2
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite function call 2' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite function call 3
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite function call 3' }, { status: 400 })
    }
    
    // TypeScript guard для favoriteId в removeFavorite function call 4
    if (typeof favoriteId !== 'string') {
      return NextResponse.json({ error: 'Invalid Favorite ID type in removeFavorite function call 4' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/profile/simple-favorites/[id] - UserId:', userId, 'FavoriteId:', favoriteId)

    // Удаляем из временного хранилища
    const removed = removeFavorite(userIdInt, favoriteIdInt.toString())
    
    if (removed) {
      return NextResponse.json({ message: 'Favorite removed successfully' })
    } else {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
