const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function loginUser() {
  try {
    // Находим пользователя с ID 2
    const user = await prisma.user.findUnique({
      where: { id: 2 },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      console.log('❌ Пользователь с ID 2 не найден');
      return;
    }

    console.log('👤 Пользователь найден:', user);

    // Создаем JWT токен
    const token = jwt.sign(
      {
        sub: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        type: 'access'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('🔑 JWT токен создан:', token);

    // Устанавливаем cookie
    const cookieValue = `session=${token}; Path=/; HttpOnly; SameSite=Strict`;
    console.log('🍪 Cookie для установки:', cookieValue);
    
    console.log('\n📋 Инструкции:');
    console.log('1. Откройте браузер и перейдите на http://localhost:3000');
    console.log('2. Откройте Developer Tools (F12)');
    console.log('3. Перейдите в Application/Storage -> Cookies');
    console.log('4. Добавьте cookie с именем "session" и значением:', token);
    console.log('5. Обновите страницу');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loginUser();
