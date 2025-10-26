import { prisma } from '@/lib/db'

/**
 * Синхронизация между VenuePartner и Listing
 * 
 * VenuePartner - административный слой (что создают вендоры)
 * Listing - публичный слой (что видят пользователи)
 */

export interface VenuePartnerData {
  id: number
  name: string
  slug: string
  address?: string | null
  coverImage?: string | null
  additionalImages?: string | null
  subcategoryId: number
  vendorId: number
  cityId: number
  tariff: 'FREE' | 'SUPER' | 'MAXIMUM'
  status: 'ACTIVE' | 'MODERATION' | 'HIDDEN'
  moderationReason?: string | null
  district?: string | null
  metro?: string | null
  lat?: number | null
  lng?: number | null
  postalCode?: string | null
  timezone?: string | null
  fiasId?: string | null
  kladrId?: string | null
  createdAt: Date
  updatedAt: Date
  subcategory: {
    id: number
    name: string
    slug: string
    type: 'PLACE' | 'SERVICE'
    category: {
      id: number
      name: string
    }
  }
}

/**
 * Создать Listing на основе VenuePartner
 */
export async function createListingFromVenuePartner(venuePartner: VenuePartnerData) {
  try {
    // Получаем общую категорию "Места" для всех VenuePartner
    const placesCategory = await prisma.category.findFirst({
      where: { name: 'Места' }
    })

    if (!placesCategory) {
      throw new Error('Категория "Места" не найдена')
    }

    // Определяем тип Listing на основе типа подкатегории
    const listingType = venuePartner.subcategory.type === 'SERVICE' ? 'SERVICE' : 'VENUE'

    // Создаем Listing
    const listing = await prisma.listing.create({
      data: {
        vendorId: venuePartner.vendorId,
        cityId: venuePartner.cityId,
        categoryId: placesCategory.id,
        type: listingType,
        bookingMode: 'INSTANT', // По умолчанию с мгновенным бронированием
        title: venuePartner.name,
        slug: venuePartner.slug,
        description: null, // Можно добавить описание позже
        address: venuePartner.address,
        lat: venuePartner.lat,
        lng: venuePartner.lng,
        district: venuePartner.district,
        isActive: true,
        isFree: venuePartner.tariff === 'FREE',
        isIndoor: null, // Можно определить по параметрам
        images: (() => {
          const images = [];
          if (venuePartner.coverImage) {
            images.push(venuePartner.coverImage);
          }
          if (venuePartner.additionalImages) {
            try {
              const additionalImages = JSON.parse(venuePartner.additionalImages);
              if (Array.isArray(additionalImages)) {
                images.push(...additionalImages);
              }
            } catch (error) {
              console.error('Ошибка парсинга additionalImages:', error);
            }
          }
          return images.length > 0 ? JSON.stringify(images) : null;
        })(),
        // Дополнительные поля для совместимости
        ageFrom: null,
        ageTo: null,
        priceFrom: null,
        priceTo: null,
        eventDate: null,
        eventEndDate: null,
        claimable: false,
        claimStatus: 'PENDING'
      }
    })

    console.log(`✅ Создан Listing ${listing.id} для VenuePartner ${venuePartner.id}`)
    return listing

  } catch (error) {
    console.error('Ошибка создания Listing из VenuePartner:', error)
    throw error
  }
}

/**
 * Обновить Listing на основе VenuePartner
 */
export async function updateListingFromVenuePartner(venuePartner: VenuePartnerData) {
  try {
    // Находим существующий Listing по slug
    const existingListing = await prisma.listing.findFirst({
      where: {
        slug: venuePartner.slug,
        vendorId: venuePartner.vendorId,
        cityId: venuePartner.cityId
      }
    })

    if (!existingListing) {
      console.log(`⚠️ Listing не найден для VenuePartner ${venuePartner.id}, создаем новый`)
      return await createListingFromVenuePartner(venuePartner)
    }

    // Обновляем Listing
    const updatedListing = await prisma.listing.update({
      where: { id: existingListing.id },
      data: {
        title: venuePartner.name,
        address: venuePartner.address,
        lat: venuePartner.lat,
        lng: venuePartner.lng,
        district: venuePartner.district,
        isActive: venuePartner.status === 'ACTIVE',
        isFree: venuePartner.tariff === 'FREE',
        images: (() => {
          const images = [];
          if (venuePartner.coverImage) {
            images.push(venuePartner.coverImage);
          }
          if (venuePartner.additionalImages) {
            try {
              const additionalImages = JSON.parse(venuePartner.additionalImages);
              if (Array.isArray(additionalImages)) {
                images.push(...additionalImages);
              }
            } catch (error) {
              console.error('Ошибка парсинга additionalImages:', error);
            }
          }
          return images.length > 0 ? JSON.stringify(images) : null;
        })(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ Обновлен Listing ${updatedListing.id} для VenuePartner ${venuePartner.id}`)
    return updatedListing

  } catch (error) {
    console.error('Ошибка обновления Listing из VenuePartner:', error)
    throw error
  }
}

/**
 * Удалить Listing на основе VenuePartner
 */
export async function deleteListingFromVenuePartner(venuePartner: VenuePartnerData) {
  try {
    // Находим существующий Listing по slug
    const existingListing = await prisma.listing.findFirst({
      where: {
        slug: venuePartner.slug,
        vendorId: venuePartner.vendorId,
        cityId: venuePartner.cityId
      }
    })

    if (!existingListing) {
      console.log(`⚠️ Listing не найден для VenuePartner ${venuePartner.id}`)
      return null
    }

    // Удаляем Listing
    await prisma.listing.delete({
      where: { id: existingListing.id }
    })

    console.log(`✅ Удален Listing ${existingListing.id} для VenuePartner ${venuePartner.id}`)
    return true

  } catch (error) {
    console.error('Ошибка удаления Listing из VenuePartner:', error)
    throw error
  }
}

/**
 * Синхронизировать VenuePartner с Listing
 * Вызывается при изменении статуса VenuePartner
 */
export async function syncVenuePartnerWithListing(venuePartnerId: number) {
  try {
    // Получаем полные данные VenuePartner
    const venuePartner = await prisma.venuePartner.findUnique({
      where: { id: venuePartnerId },
      include: {
        subcategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!venuePartner) {
      throw new Error(`VenuePartner ${venuePartnerId} не найден`)
    }

    console.log(`🔄 Синхронизация VenuePartner ${venuePartnerId} со статусом ${venuePartner.status}`)

    switch (venuePartner.status) {
      case 'ACTIVE':
        // Создаем или обновляем Listing
        const existingListing = await prisma.listing.findFirst({
          where: {
            slug: venuePartner.slug,
            vendorId: venuePartner.vendorId,
            cityId: venuePartner.cityId
          }
        })

        if (existingListing) {
          await updateListingFromVenuePartner(venuePartner)
        } else {
          await createListingFromVenuePartner(venuePartner)
        }
        break

      case 'HIDDEN':
        // Удаляем Listing
        await deleteListingFromVenuePartner(venuePartner)
        break

      case 'MODERATION':
        // Удаляем Listing (на модерации не показываем)
        await deleteListingFromVenuePartner(venuePartner)
        break

      default:
        console.log(`⚠️ Неизвестный статус VenuePartner: ${venuePartner.status}`)
    }

  } catch (error) {
    console.error('Ошибка синхронизации VenuePartner с Listing:', error)
    throw error
  }
}

/**
 * Синхронизировать все активные VenuePartner с Listing
 * Полезно для первоначальной настройки или восстановления
 */
export async function syncAllActiveVenuePartners() {
  try {
    console.log('🔄 Синхронизация всех активных VenuePartner...')

    const activeVenuePartners = await prisma.venuePartner.findMany({
      where: { status: 'ACTIVE' },
      include: {
        subcategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    console.log(`Найдено ${activeVenuePartners.length} активных VenuePartner`)

    for (const venuePartner of activeVenuePartners) {
      try {
        await updateListingFromVenuePartner(venuePartner)
      } catch (error) {
        console.error(`Ошибка синхронизации VenuePartner ${venuePartner.id}:`, error)
      }
    }

    console.log('✅ Синхронизация завершена')

  } catch (error) {
    console.error('Ошибка синхронизации всех VenuePartner:', error)
    throw error
  }
}
