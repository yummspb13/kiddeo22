const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAuthorsAPI() {
  try {
    console.log('🔍 Testing authors API...')

    // Проверяем пользователей
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            Content: {
              where: {
                type: 'blog',
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    console.log(`👥 Found ${users.length} users`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user._count.Content} posts`)
    })

    // Проверяем статьи
    const posts = await prisma.content.findMany({
      where: { type: 'blog' },
      include: {
        User_Content_authorIdToUser: {
          select: { name: true }
        }
      }
    })

    console.log(`\n📝 Found ${posts.length} blog posts`)
    posts.forEach(post => {
      console.log(`  - ${post.title} by ${post.User_Content_authorIdToUser.name}`)
    })

  } catch (error) {
    console.error('❌ Error testing authors API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthorsAPI()
