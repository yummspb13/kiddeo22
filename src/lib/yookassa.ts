// src/lib/yookassa.ts
import prisma from "@/lib/db"
import { PaymentStatus } from "@prisma/client"

// Конфигурация YooKassa
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || "your_shop_id"
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || "your_secret_key"
const YOOKASSA_BASE_URL = "https://api.yookassa.ru/v3"

interface YooKassaPaymentRequest {
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    type: string
    return_url: string
  }
  description: string
  metadata: {
    orderId: string
    userId: string
    vendorId: string
  }
}

interface YooKassaPaymentResponse {
  id: string
  status: string
  paid: boolean
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    type: string
    confirmation_url?: string
  }
  created_at: string
  description: string
  metadata: Record<string, string>
}

// Создание платежа в YooKassa
export async function createYooKassaPayment(
  orderId: string,
  amount: number,
  description: string,
  returnUrl: string,
  userId: number,
  vendorId: number
): Promise<{ paymentId: number; ykId: string; paymentUrl: string }> {
  const paymentData: YooKassaPaymentRequest = {
    amount: {
      value: (amount / 100).toFixed(2), // конвертируем из копеек в рубли
      currency: "RUB"
    },
    confirmation: {
      type: "redirect",
      return_url: returnUrl
    },
    description,
    metadata: {
      orderId,
      userId: userId.toString(),
      vendorId: vendorId.toString()
    }
  }

  try {
    // В реальной версии здесь будет HTTP запрос к YooKassa API
    // Пока что симулируем создание платежа
    const mockResponse: YooKassaPaymentResponse = {
      id: `yk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      paid: false,
      amount: paymentData.amount,
      confirmation: {
        type: "redirect",
        confirmation_url: `https://yoomoney.ru/checkout/payments/v2/show?orderId=${orderId}`
      },
      created_at: new Date().toISOString(),
      description,
      metadata: paymentData.metadata
    }

    // Создаем запись о платеже в базе данных
    const payment = await prisma.payment.create({
      data: {
        orderId,
        vendorId,
        userId,
        amount,
        currency: "RUB",
        status: "PENDING",
        paymentMethod: "yookassa",
        ykId: mockResponse.id,
        ykUrl: mockResponse.confirmation.confirmation_url,
        description,
        metadata: {
          ykResponse: mockResponse as any
        }
      }
    })

    return {
      paymentId: payment.id,
      ykId: mockResponse.id,
      paymentUrl: mockResponse.confirmation.confirmation_url!
    }
  } catch (error) {
    console.error("Ошибка создания платежа YooKassa:", error)
    throw new Error("Не удалось создать платеж")
  }
}

// Обработка webhook от YooKassa
export async function handleYooKassaWebhook(webhookData: unknown): Promise<void> {
  try {
    const { object } = webhookData
    
    if (object.event === "payment.succeeded") {
      await processSuccessfulPayment(object)
    } else if (object.event === "payment.canceled") {
      await processCanceledPayment(object)
    } else if (object.event === "payment.waiting_for_capture") {
      await processWaitingPayment(object)
    }
  } catch (error) {
    console.error("Ошибка обработки webhook YooKassa:", error)
    throw error
  }
}

// Обработка успешного платежа
async function processSuccessfulPayment(paymentData: unknown): Promise<void> {
  const ykId = paymentData.id
  const paidAmount = Math.round(parseFloat(paymentData.amount.value) * 100) // конвертируем в копейки

  // Находим платеж в базе данных
  const payment = await prisma.payment.findFirst({
    where: { ykId: ykId },
    include: { order: true }
  })

  if (!payment) {
    console.error(`Платеж с YooKassa ID ${ykId} не найден`)
    return
  }

  // Проверяем сумму
  if (payment.amount !== paidAmount) {
    console.error(`Несоответствие суммы платежа. Ожидалось: ${payment.amount}, получено: ${paidAmount}`)
    return
  }

  // Обновляем статус платежа
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date()
    }
  })

  // Обновляем статус заказа
  await prisma.order.update({
    where: { id: payment.orderId! },
    data: { status: "PAID" }
  })

  // Создаем билеты
  if (payment.orderId) {
    await confirmOrder(payment.orderId)
  }

  // Начисляем баллы за покупку (1 балл за рубль)
  if (payment.userId && payment.orderId) {
    const pointsToAward = Math.floor(payment.amount / 100) // 1 балл за рубль (amount в копейках)
    
    if (pointsToAward > 0) {
      try {
        const { addPoints, POINTS_CATEGORIES, POINTS_VALUES } = await import('@/lib/points')
        await addPoints({
          userId: payment.userId,
          points: pointsToAward,
          category: POINTS_CATEGORIES.PURCHASE,
          description: `Покупка билетов на сумму ${Math.floor(payment.amount / 100)} руб.`,
          orderId: payment.orderId
        })
        console.log(`✅ Начислено ${pointsToAward} баллов за покупку`)
      } catch (pointsError) {
        console.error('Ошибка начисления баллов за покупку:', pointsError)
      }
    }
    
    // Также начисляем баллы лояльности (старая система)
    await awardLoyaltyPoints(payment.userId, payment.amount, payment.orderId)
  }
}

// Обработка отмененного платежа
async function processCanceledPayment(paymentData: unknown): Promise<void> {
  const ykId = paymentData.id

  const payment = await prisma.payment.findFirst({
    where: { ykId: ykId }
  })

  if (!payment) {
    console.error(`Платеж с YooKassa ID ${ykId} не найден`)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "CANCELLED" }
  })

  await prisma.order.update({
    where: { id: payment.orderId! },
    data: { status: "CANCELLED" }
  })
}

// Обработка платежа в ожидании
async function processWaitingPayment(paymentData: unknown): Promise<void> {
  const ykId = paymentData.id

  const payment = await prisma.payment.findFirst({
    where: { ykId: ykId }
  })

  if (!payment) {
    console.error(`Платеж с YooKassa ID ${ykId} не найден`)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PENDING" }
  })
}

// Проверка статуса платежа
export async function checkPaymentStatus(paymentId: number): Promise<PaymentStatus> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { status: true, ykId: true }
  })

  if (!payment) {
    throw new Error("Платеж не найден")
  }

  // В реальной версии здесь будет запрос к YooKassa API для проверки статуса
  // Пока что возвращаем статус из базы данных
  return payment.status as PaymentStatus
}

// Создание возврата
export async function createRefund(
  paymentId: number,
  amount: number,
  reason?: string
): Promise<{ refundId: string; status: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true }
  })

  if (!payment) {
    throw new Error("Платеж не найден")
  }

  if (payment.status !== "PAID") {
    throw new Error("Платеж не может быть возвращен")
  }

  if (amount > payment.amount) {
    throw new Error("Сумма возврата превышает сумму платежа")
  }

  try {
    // В реальной версии здесь будет запрос к YooKassa API для создания возврата
    const mockRefundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Создаем запись о возврате
    const refund = await prisma.refund.create({
      data: {
        orderId: payment.orderId!,
        paymentId: payment.id,
        amount,
        reason,
        status: "PENDING",
        externalId: mockRefundId
      }
    })

    return {
      refundId: refund.id,
      status: refund.status
    }
  } catch (error) {
    console.error("Ошибка создания возврата:", error)
    throw new Error("Не удалось создать возврат")
  }
}

// Вспомогательные функции (импорты из других модулей)
async function confirmOrder(orderId: string): Promise<void> {
  // Импортируем функцию из orders.ts
  const { confirmOrder } = await import("./orders")
  return confirmOrder(orderId)
}

async function awardLoyaltyPoints(userId: number, amount: number, orderId: string): Promise<void> {
  // Импортируем функцию из loyalty.ts
  const { awardLoyaltyPoints } = await import("./loyalty")
  return awardLoyaltyPoints(userId, amount, orderId)
}