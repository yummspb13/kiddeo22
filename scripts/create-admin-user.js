#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Проверяем, существует ли уже админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@kiddeo.ru' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role
      });
      
      // Обновляем пароль на случай, если он изменился
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@kiddeo.ru' },
        data: { 
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin password updated to: admin123');
      return existingAdmin;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kiddeo.ru',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    });
    
    console.log('✅ Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      password: 'admin123'
    });
    
    return admin;
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем создание админа
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Admin user setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
