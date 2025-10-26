const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
    }
  }
})

async function addFeaturesParameter() {
  try {
    console.log('🔍 Adding FEATURES_JSON parameter...')
    
    // Проверяем, существует ли параметр
    const existingParameter = await prisma.parameter.findFirst({
      where: { name: 'FEATURES_JSON' }
    })
    
    if (existingParameter) {
      console.log('✅ FEATURES_JSON parameter already exists')
      return
    }
    
    // Создаем параметр
    const parameter = await prisma.parameter.create({
      data: {
        name: 'FEATURES_JSON',
        type: 'TEXT',
        isRequired: false,
        isActive: true,
        description: 'JSON array of venue features with icons and text'
      }
    })
    
    console.log('✅ Created FEATURES_JSON parameter:', parameter)
    
  } catch (error) {
    console.error('❌ Error adding FEATURES_JSON parameter:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addFeaturesParameter()
