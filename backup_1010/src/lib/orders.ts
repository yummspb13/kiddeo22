// src/lib/orders.ts
import prisma from "@/lib/db"
import { OrderStatus, PaymentStatus, TicketStatus } from "@prisma/client"
import { generateQRCode } from "./qr-generator"

export interface CreateOrderData {
  userId: number
  vendorId: number
  listingId: number
  items: Array<{
    ticketTypeId: number
    quantity: number
  }>
  promoCode?: string
  loyaltyPointsUsed?: number
  notes?: string
}

export interface OrderWithDetails {
  id: string
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  finalAmount: number
  currency: string
  notes?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  user: {
    id: number
    name?: string
    email: string
  }
  vendor: {
    id: number
    displayName: string
    email?: string
  }
  listing: {
    id: number
    title: string
    slug: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    ticketType: {
      id: number
      name: string
    }
  }>
  payments: Array<{
    id: number
    status: PaymentStatus
    amount: number
    ykId?: string
    ykUrl?: string
    paidAt?: Date
  }>
  tickets: Array<{
    id: string
    qrCode: string
    status: TicketStatus
    usedAt?: Date
  }>
}

// Создание заказа
export async function createOrder(data: CreateOrderData): Promise<OrderWithDetails> {
  const { userId, vendorId, listingId, items, promoCode, loyaltyPointsUsed = 0, notes } = data

  // Получаем информацию о листинге и типах билетов
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      vendor: true,
      tickets: true
    }
  })

  if (!listing) {
    throw new Error("Листинг не найден")
  }

  if (listing.vendorId !== vendorId) {
    throw new Error("Неверный вендор")
  }

  // Проверяем доступность билетов
  const ticketTypes = await prisma.eventTicketType.findMany({
    where: {
      id: { in: items.map(item => item.ticketTypeId) },
      listingId
    }
  })

  if (ticketTypes.length !== items.length) {
    throw new Error("Некоторые типы билетов не найдены")
  }

  // Проверяем наличие на складе
  for (const item of items) {
    const ticketType = ticketTypes.find(tt => tt.id === item.ticketTypeId)
    if (ticketType?.stock && ticketType.stock < item.quantity) {
      throw new Error(`Недостаточно билетов для типа "${ticketType.name}"`)
    }
  }

  // Рассчитываем стоимость
  let totalAmount = 0
  const orderItems = []

  for (const item of items) {
    const ticketType = ticketTypes.find(tt => tt.id === item.ticketTypeId)!
    const unitPrice = ticketType.price * 100 // конвертируем в копейки
    const totalPrice = unitPrice * item.quantity
    totalAmount += totalPrice

    orderItems.push({
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      unitPrice,
      totalPrice
    })
  }

  // Применяем промокод
  let discountAmount = 0
  let promoCodeId: string | null = null

  if (promoCode) {
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: promoCode,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      }
    })

    if (promo) {
      promoCodeId = promo.id
      
      if (promo.type === 'PERCENTAGE') {
        discountAmount = Math.floor(totalAmount * promo.value / 100)
      } else if (promo.type === 'FIXED_AMOUNT') {
        discountAmount = promo.value
      }

      // Применяем максимальную скидку если указана
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount
      }
    }
  }

  // Применяем баллы лояльности
  const loyaltyDiscount = Math.min(loyaltyPointsUsed * 10, totalAmount) // 1 балл = 10 копеек
  discountAmount += loyaltyDiscount

  const finalAmount = Math.max(0, totalAmount - discountAmount)

  // Создаем заказ
  const order = await prisma.order.create({
    data: {
      userId,
      vendorId,
      listingId,
      totalAmount,
      discountAmount,
      finalAmount,
      promoCodeId,
      loyaltyPointsUsed,
      notes,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 минут на оплату
      items: {
        create: orderItems
      }
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      vendor: {
        select: { id: true, displayName: true, email: true }
      },
      listing: {
        select: { id: true, title: true, slug: true }
      },
      items: {
        include: {
          ticketType: {
            select: { id: true, name: true }
          }
        }
      },
      payments: {
        select: {
          id: true,
          status: true,
          amount: true,
          ykId: true,
          ykUrl: true,
          paidAt: true
        }
      },
      tickets: {
        select: {
          id: true,
          qrCode: true,
          status: true,
          usedAt: true
        }
      }
    }
  })

  return order as OrderWithDetails
}

// Подтверждение заказа (создание билетов)
export async function confirmOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          ticketType: true
        }
      }
    }
  })

  if (!order) {
    throw new Error("Заказ не найден")
  }

  if (order.status !== 'PAID') {
    throw new Error("Заказ не оплачен")
  }

  // Создаем билеты для каждого элемента заказа
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      const qrCode = await generateQRCode(`${orderId}-${item.id}-${i}`)
      
      await prisma.ticket.create({
        data: {
          orderId: order.id,
          orderItemId: item.id,
          userId: order.userId,
          vendorId: order.vendorId,
          listingId: order.listingId,
          ticketTypeId: item.ticketTypeId,
          qrCode
        }
      })
    }
  }

  // Обновляем статус заказа
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CONFIRMED' }
  })
}

// Отмена заказа
export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    throw new Error("Заказ не найден")
  }

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    throw new Error("Заказ уже отменен")
  }

  // Отменяем билеты
  await prisma.ticket.updateMany({
    where: { orderId },
    data: { status: 'CANCELLED' }
  })

  // Обновляем статус заказа
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: 'CANCELLED',
      notes: reason ? `${order.notes || ''}\nПричина отмены: ${reason}`.trim() : order.notes
    }
  })
}

// Получение заказа с деталями
export async function getOrderWithDetails(orderId: string): Promise<OrderWithDetails | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      vendor: {
        select: { id: true, displayName: true, email: true }
      },
      listing: {
        select: { id: true, title: true, slug: true }
      },
      items: {
        include: {
          ticketType: {
            select: { id: true, name: true }
          }
        }
      },
      payments: {
        select: {
          id: true,
          status: true,
          amount: true,
          ykId: true,
          ykUrl: true,
          paidAt: true
        }
      },
      tickets: {
        select: {
          id: true,
          qrCode: true,
          status: true,
          usedAt: true
        }
      }
    }
  })

  return order as OrderWithDetails | null
}

// Получение заказов пользователя
export async function getUserOrders(userId: number, limit: number = 20, offset: number = 0) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        vendor: {
          select: { id: true, displayName: true }
        },
        listing: {
          select: { id: true, title: true, slug: true }
        },
        items: {
          include: {
            ticketType: {
              select: { id: true, name: true }
            }
          }
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            paidAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.order.count({ where: { userId } })
  ])

  return { orders, total }
}

// Получение заказов вендора
export async function getVendorOrders(vendorId: number, limit: number = 20, offset: number = 0) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { vendorId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        listing: {
          select: { id: true, title: true, slug: true }
        },
        items: {
          include: {
            ticketType: {
              select: { id: true, name: true }
            }
          }
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            paidAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.order.count({ where: { vendorId } })
  ])

  return { orders, total }
}

// Проверка истечения заказов
export async function checkExpiredOrders(): Promise<void> {
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() }
    }
  })

  for (const order of expiredOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'EXPIRED' }
    })
  }
}

// Статистика заказов
export async function getOrderStats(vendorId?: number, userId?: number) {
  const where: unknown = {}
  if (vendorId) where.vendorId = vendorId
  if (userId) where.userId = userId

  const [
    totalOrders,
    paidOrders,
    cancelledOrders,
    totalRevenue,
    avgOrderValue
  ] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, status: 'PAID' } }),
    prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.order.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { finalAmount: true }
    }),
    prisma.order.aggregate({
      where: { ...where, status: 'PAID' },
      _avg: { finalAmount: true }
    })
  ])

  return {
    totalOrders,
    paidOrders,
    cancelledOrders,
    totalRevenue: totalRevenue._sum.finalAmount || 0,
    avgOrderValue: avgOrderValue._avg.finalAmount || 0,
    conversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0
  }
}
