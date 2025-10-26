const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBlogData() {
  try {
    console.log('🔍 Checking blog data...')

    // Проверяем категории
    const categories = await prisma.contentCategory.findMany()
    console.log(`📂 Categories: ${categories.length}`)
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`)
    })

    // Проверяем статьи
    const posts = await prisma.content.findMany({
      where: { type: 'blog' },
      include: {
        ContentCategory: true,
        User_Content_authorIdToUser: {
          select: { name: true }
        }
      }
    })
    console.log(`\n📝 Blog posts: ${posts.length}`)
    posts.forEach(post => {
      console.log(`  - ${post.title} (${post.slug}) - ${post.status}`)
      console.log(`    Author: ${post.User_Content_authorIdToUser.name}`)
      console.log(`    Category: ${post.ContentCategory?.name || 'None'}`)
    })

    // Проверяем лайки
    const likes = await prisma.contentLike.count()
    console.log(`\n❤️ Total likes: ${likes}`)

    // Проверяем комментарии
    const comments = await prisma.contentComment.count()
    console.log(`💬 Total comments: ${comments}`)

    console.log('\n✅ Check completed!')
  } catch (error) {
    console.error('❌ Error checking blog data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBlogData()
