import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ApiError, handleApiError, safeExecute } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Upload avatar - Starting request')
    
    const session = await getServerSession(request)
    console.log('📸 Upload avatar - Session:', !!session)
    
    // Используем uid вместо id
    const userId = session?.user?.id || (session?.user as any)?.id
    console.log('📸 Upload avatar - User ID:', userId)
    
    if (!userId) {
      throw new ApiError('Необходима авторизация', 401)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new ApiError('Файл не найден', 400)
    }

    // Валидация файла
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if (file.size > maxSize) {
      throw new ApiError('Размер файла не должен превышать 5MB', 400)
    }

    if (!allowedTypes.includes(file.type)) {
      throw new ApiError('Разрешены только файлы: JPG, PNG, GIF, WebP', 400)
    }

    // Создаем уникальное имя файла
    const fileExtension = file.name.split('.').pop()
    if (!fileExtension) {
      throw new ApiError('Неверный формат файла', 400)
    }
    
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Создаем папку для аватаров пользователей
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    await safeExecute(
      () => mkdir(uploadDir, { recursive: true }),
      undefined,
      'Creating upload directory'
    )
    
    // Сохраняем файл
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await safeExecute(
      () => writeFile(filePath, buffer),
      undefined,
      'Writing file to disk'
    )
    
    // Создаем URL для доступа к файлу
    const imageUrl = `/uploads/avatars/${fileName}`
    
    // Обновляем аватар пользователя в базе данных
    const updatedUser = await safeExecute(
      () => prisma.user.update({
        where: { id: parseInt(String(userId)) },
        data: { image: imageUrl }
      }),
      null,
      'Updating user avatar in database'
    )
    
    if (!updatedUser) {
      throw new ApiError('Не удалось обновить аватар в базе данных', 500)
    }
    
    console.log('✅ Upload avatar - Success:', imageUrl)

    return NextResponse.json({ 
      success: true,
      message: 'Аватар успешно загружен',
      imageUrl 
    })
  } catch (error) {
    const errorResponse = handleApiError(error, 'Upload Avatar')
    console.error('❌ Upload avatar error:', errorResponse)
    
    return NextResponse.json(errorResponse, { 
      status: errorResponse.statusCode || 500 
    })
  }
}
