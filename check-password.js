const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@kiddeo.ru' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    })
    
    if (!user) {
      console.log('User not found')
      return
    }
    
    console.log('User found:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('Password hash:', user.password)
    
    // Попробуем несколько стандартных паролей
    const commonPasswords = ['admin', 'password', '123456', 'admin123', 'kiddeo', 'test']
    
    console.log('\nTesting common passwords:')
    for (const password of commonPasswords) {
      const isValid = await bcrypt.compare(password, user.password)
      console.log(`Password "${password}": ${isValid ? '✅ VALID' : '❌ Invalid'}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPassword()
