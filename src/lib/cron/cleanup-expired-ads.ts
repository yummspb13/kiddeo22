import prisma from '@/lib/db'

export async function cleanupExpiredAds() {
  try {
    const now = new Date()
    
    // Находим истекшие объявления
    const expiredAds = await prisma.homePageAd.findMany({
      where: {
        isActive: true,
        endsAt: {
          lt: now
        }
      },
      select: {
        id: true,
        blockType: true,
        citySlug: true,
        contentId: true,
        contentType: true
      }
    })

    if (expiredAds.length === 0) {
      console.log('No expired ads found')
      return { cleaned: 0, ads: [] }
    }

    // Деактивируем истекшие объявления
    const result = await prisma.homePageAd.updateMany({
      where: {
        id: {
          in: expiredAds.map(ad => ad.id)
        }
      },
      data: {
        isActive: false
      }
    })

    console.log(`Cleaned up ${result.count} expired ads`)
    
    return {
      cleaned: result.count,
      ads: expiredAds.map(ad => ({
        id: ad.id,
        blockType: ad.blockType,
        citySlug: ad.citySlug,
        contentId: ad.contentId,
        contentType: ad.contentType
      }))
    }
  } catch (error) {
    console.error('Error cleaning up expired ads:', error)
    throw error
  }
}
