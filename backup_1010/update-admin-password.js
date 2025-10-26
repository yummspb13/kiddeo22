// Обновление пароля для admin@kiddeo.ru
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin password...');
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Обновляем пароль
    const user = await prisma.user.update({
      where: { email: 'admin@kiddeo.ru' },
      data: { 
        password: hashedPassword,
        role: 'ADMIN' // Устанавливаем роль админа
      }
    });
    
    console.log('✅ Admin password updated:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
  } catch (error) {
    console.error('❌ Failed to update admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
