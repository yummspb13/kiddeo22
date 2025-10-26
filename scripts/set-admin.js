const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminRole() {
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

    console.log('👤 Текущий пользователь:', user);

    // Устанавливаем роль ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: 2 },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true }
    });

    console.log('✅ Роль изменена на ADMIN:', updatedUser);
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminRole();
