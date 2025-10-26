#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();

async function generateTestToken() {
  try {
    console.log('🔑 Generating test token for admin user...');
    
    // Получаем админа
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@kiddeo.ru' }
    });
    
    if (!admin) {
      console.error('❌ Admin user not found. Please run create-admin-user.js first.');
      process.exit(1);
    }
    
    // Генерируем JWT токен
    const rawSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-key';
    const secret = new TextEncoder().encode(rawSecret);
    
    const token = await new SignJWT({
      sub: admin.id.toString(),
      email: admin.email,
      name: admin.name || 'Admin User',
      role: admin.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);
    
    console.log('✅ Test token generated successfully!');
    console.log('📋 Token details:');
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('');
    console.log('🔑 JWT Token:');
    console.log(token);
    console.log('');
    console.log('💡 Usage:');
    console.log('   Add this header to your API requests:');
    console.log(`   Authorization: Bearer ${token}`);
    console.log(`   Cookie: session=${token}`);
    
    return token;
    
  } catch (error) {
    console.error('❌ Failed to generate test token:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем генерацию токена
if (require.main === module) {
  generateTestToken()
    .then(() => {
      console.log('🎉 Token generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Token generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateTestToken };
