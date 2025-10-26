import { prisma } from '@/lib/db'

export interface ModerationHistoryData {
  vendorId: number
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO' | 'RESUBMITTED'
  previousStatus?: string
  newStatus?: string
  moderatorId?: number
  moderatorNotes?: string
  rejectionReason?: string
  documentsCount?: number
  documentsList?: Array<{
    fileName: string
    fileUrl: string
    docType: string
    fileSize?: number
  }>
  ipAddress?: string
  userAgent?: string
}

export async function createModerationHistory(data: ModerationHistoryData) {
  try {
    const history = await prisma.vendorModerationHistory.create({
      data: {
        vendorId: data.vendorId,
        action: data.action,
        previousStatus: data.previousStatus as any,
        newStatus: data.newStatus as any,
        moderatorId: data.moderatorId,
        moderatorNotes: data.moderatorNotes,
        rejectionReason: data.rejectionReason,
        documentsCount: data.documentsCount,
        documentsList: data.documentsList,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📝 Moderation history created: ${data.action} for vendor ${data.vendorId}`)
    return history
  } catch (error) {
    console.error('❌ Error creating moderation history:', error)
    throw error
  }
}

export async function getVendorModerationHistory(vendorId: number) {
  try {
    const history = await prisma.vendorModerationHistory.findMany({
      where: { vendorId },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return history
  } catch (error) {
    console.error('❌ Error fetching moderation history:', error)
    throw error
  }
}

export async function getModerationHistoryStats(vendorId: number) {
  try {
    const stats = await prisma.vendorModerationHistory.groupBy({
      by: ['action'],
      where: { vendorId },
      _count: { action: true }
    })

    const totalSubmissions = await prisma.vendorModerationHistory.count({
      where: { 
        vendorId,
        action: 'SUBMITTED'
      }
    })

    const totalResubmissions = await prisma.vendorModerationHistory.count({
      where: { 
        vendorId,
        action: 'RESUBMITTED'
      }
    })

    return {
      actionCounts: stats,
      totalSubmissions,
      totalResubmissions,
      totalAttempts: totalSubmissions + totalResubmissions
    }
  } catch (error) {
    console.error('❌ Error fetching moderation stats:', error)
    throw error
  }
}
