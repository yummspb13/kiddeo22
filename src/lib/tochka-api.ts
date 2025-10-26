// src/lib/tochka-api.ts - Подготовка для интеграции с API Точки
// Документация: https://developers.tochka.com/?from=https://enter.tochka.com//redoc#section/Pro-API

interface TochkaPaymentRequest {
  amount: {
    value: string
    currency: string
  }
  description: string
  metadata: {
    orderId: string
    userId: string
    vendorId: string
  }
  returnUrl: string
}

interface TochkaPaymentResponse {
  id: string
  status: string
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    type: string
    confirmation_url: string
  }
  created_at: string
  description: string
  metadata: Record<string, string>
}

// Конфигурация API Точки
const TOCHKA_API_URL = process.env.TOCHKA_API_URL || "https://api.tochka.com"
const TOCHKA_CLIENT_ID = process.env.TOCHKA_CLIENT_ID || ""
const TOCHKA_CLIENT_SECRET = process.env.TOCHKA_CLIENT_SECRET || ""

// Создание платежа через API Точки
export async function createTochkaPayment(
  orderId: string,
  amount: number,
  description: string,
  returnUrl: string,
  userId: number,
  vendorId: number
): Promise<{ paymentId: number; tochkaId: string; paymentUrl: string }> {
  
  // ⚠️ ВРЕМЕННО: Возвращаем заглушку до настройки API Точки
  if (!TOCHKA_CLIENT_ID || !TOCHKA_CLIENT_SECRET) {
    console.warn('⚠️ TOCHKA API credentials not configured. Using mock payment.')
    
    const mockResponse: TochkaPaymentResponse = {
      id: `tochka_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      amount: {
        value: (amount / 100).toFixed(2),
        currency: "RUB"
      },
      confirmation: {
        type: "redirect",
        confirmation_url: `https://tochka.com/payment/${orderId}`
      },
      created_at: new Date().toISOString(),
      description,
      metadata: {
        orderId,
        userId: userId.toString(),
        vendorId: vendorId.toString()
      }
    }

    // Создаем запись о платеже в базе данных
    const { prisma } = await import('@/lib/prisma')
    const payment = await prisma.payment.create({
      data: {
        orderId,
        vendorId,
        userId,
        amount,
        currency: "RUB",
        status: "PENDING",
        paymentMethod: "tochka",
        ykId: mockResponse.id, // Используем существующее поле
        ykUrl: mockResponse.confirmation.confirmation_url,
        description,
        metadata: {
          tochkaResponse: mockResponse as any,
          isMock: true
        }
      }
    })

    return {
      paymentId: payment.id,
      tochkaId: mockResponse.id,
      paymentUrl: mockResponse.confirmation.confirmation_url
    }
  }

  // TODO: Реальная интеграция с API Точки
  const paymentData: TochkaPaymentRequest = {
    amount: {
      value: (amount / 100).toFixed(2),
      currency: "RUB"
    },
    description,
    metadata: {
      orderId,
      userId: userId.toString(),
      vendorId: vendorId.toString()
    },
    returnUrl
  }

  try {
    // Здесь будет реальный HTTP запрос к API Точки
    // const response = await fetch(`${TOCHKA_API_URL}/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getTochkaAccessToken()}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(paymentData)
    // })
    
    throw new Error('Tochka API integration not implemented yet')
  } catch (error) {
    console.error("Ошибка создания платежа Tochka:", error)
    throw error
  }
}

// Обработка webhook от API Точки
export async function handleTochkaWebhook(webhookData: unknown): Promise<void> {
  try {
    // TODO: Реализовать обработку webhook от API Точки
    console.log('Tochka webhook received:', webhookData)
    
    // Обработка успешного платежа
    // await processSuccessfulTochkaPayment(webhookData)
  } catch (error) {
    console.error("Ошибка обработки webhook Tochka:", error)
    throw error
  }
}

// Получение access token для API Точки
async function getTochkaAccessToken(): Promise<string> {
  // TODO: Реализовать OAuth2 flow для получения access token
  throw new Error('Tochka OAuth2 not implemented yet')
}

// Обработка успешного платежа
async function processSuccessfulTochkaPayment(paymentData: unknown): Promise<void> {
  // TODO: Реализовать обработку успешного платежа
  console.log('Processing successful Tochka payment:', paymentData)
}

// Экспорт для совместимости с существующим кодом
export const createYooKassaPayment = createTochkaPayment
export const handleYooKassaWebhook = handleTochkaWebhook
