import { prisma } from '@/lib/db'

export interface VenueOwnershipInfo {
  isOwner: boolean
  isAdmin: boolean
  isKiddeoEvents: boolean
  canClaim: boolean
  vendorId?: number
  vendorName?: string
}

/**
 * Проверяет, является ли пользователь владельцем места
 */
export async function checkVenueOwnership(
  venueId: number, 
  userId?: number
): Promise<VenueOwnershipInfo> {
  try {
    // Получаем информацию о месте
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        vendorId: true,
        vendor: {
          select: {
            id: true,
            displayName: true,
            type: true,
            status: true,
            userId: true
          }
        }
      }
    })

    if (!venue) {
      return {
        isOwner: false,
        isAdmin: false,
        isKiddeoEvents: false,
        canClaim: false
      }
    }

    // Проверяем, является ли пользователь владельцем
    const isOwner = userId ? venue.vendor.userId === userId : false

    // Проверяем, является ли это Kiddeo Events
    const isKiddeoEvents = venue.vendor.displayName === 'Kiddeo Events' || 
                          venue.vendor.displayName === 'Kiddeo'

    // Проверяем, может ли пользователь заявить права
    // (только для мест Kiddeo Events или неактивных вендоров)
    const canClaim = !isOwner && 
                    (isKiddeoEvents || venue.vendor.status !== 'ACTIVE')

    return {
      isOwner,
      isAdmin: false, // В будущем можно добавить проверку роли админа
      isKiddeoEvents,
      canClaim,
      vendorId: venue.vendorId,
      vendorName: venue.vendor.displayName
    }

  } catch (error) {
    console.error('Error checking venue ownership:', error)
    return {
      isOwner: false,
      isAdmin: false,
      isKiddeoEvents: false,
      canClaim: false
    }
  }
}

/**
 * Проверяет, нужно ли показывать кнопку "Это моя компания"
 */
export function shouldShowClaimButton(ownership: VenueOwnershipInfo): boolean {
  return ownership.canClaim
}

/**
 * Проверяет, нужно ли показывать статус "Это ваша компания"
 */
export function shouldShowOwnerStatus(ownership: VenueOwnershipInfo): boolean {
  return ownership.isOwner || ownership.isAdmin
}
