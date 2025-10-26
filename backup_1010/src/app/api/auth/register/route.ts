import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { addPoints, POINTS_CATEGORIES, POINTS_VALUES } from '@/lib/points'
import { signJWT } from '@/lib/jwt'

// Функция для защиты от Punycode в email
function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    // Заменяем Punycode обратно на обычные домены
    .replace(/xn--om-nmc/g, 'com')
    .replace(/xn--p1ai/g, 'ru')
    // Заменяем кириллические символы на латинские в доменах
    .replace(/\.сom$/g, '.com')
    .replace(/\.ру$/g, '.ru')
    // Дополнительная защита от смешанных символов
    .replace(/([а-яё])/gi, (match, char) => {
      const cyrillicToLatin: Record<string, string> = {
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x'
      }
      return cyrillicToLatin[char.toLowerCase()] || char
    })
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен содержать минимум 6 символов' }, { status: 400 })
    }

    // Очищаем email от Punycode и кириллических символов
    const cleanEmail = sanitizeEmail(email)
    
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date() // Активируем пользователя сразу после регистрации
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Начисляем баллы за регистрацию
    try {
      await addPoints({
        userId: user.id,
        points: POINTS_VALUES.REGISTRATION,
        category: POINTS_CATEGORIES.REGISTRATION,
        description: 'Бонус за регистрацию'
      })
    } catch (pointsError) {
      console.error('Error adding registration points:', pointsError)
      // Не прерываем регистрацию из-за ошибки с баллами
    }

    // Создаем JWT токен для автовхода
    const token = await signJWT({
      sub: user.id.toString(),
      email: user.email,
      name: user.name || user.email,
      role: user.role.toString()
    })

    // Создаем ответ с установкой httpOnly куки
    const response = NextResponse.json({ 
      success: true,
      message: 'Пользователь успешно создан',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Устанавливаем httpOnly куку для автовхода
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response
  } catch (error) {
    console.error('Ошибка при регистрации:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Ошибка при регистрации',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
