import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    // Используем uid вместо id
    const userId = session?.user?.id || (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Текущий и новый пароль обязательны' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Новый пароль должен содержать минимум 6 символов' }, { status: 400 })
    }

    // Получаем пользователя с паролем
    const user = await prisma.user.findUnique({
      where: { id: parseInt(String(userId)) },
      select: {
        id: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 })
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Обновляем пароль
    await prisma.user.update({
      where: { id: parseInt(String(userId)) },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({ message: 'Пароль успешно изменен' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ message: 'Error changing password' }, { status: 500 })
  }
}
