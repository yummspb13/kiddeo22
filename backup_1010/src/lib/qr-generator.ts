// src/lib/qr-generator.ts
import crypto from 'crypto'

// Простая генерация QR-кода (в реальной версии можно использовать библиотеку qrcode)
export async function generateQRCode(data: string): Promise<string> {
  // Генерируем уникальный код на основе данных и времени
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(8).toString('hex')
  const hash = crypto.createHash('sha256').update(`${data}-${timestamp}-${random}`).digest('hex')
  
  // Возвращаем короткий уникальный код
  return hash.substring(0, 16).toUpperCase()
}

// Валидация QR-кода
export function validateQRCode(qrCode: string): boolean {
  // Проверяем формат QR-кода (16 символов, только буквы и цифры)
  return /^[A-Z0-9]{16}$/.test(qrCode)
}

// Извлечение информации из QR-кода
export function parseQRCode(qrCode: string): { orderId: string; itemId: string; index: number } | null {
  if (!validateQRCode(qrCode)) {
    return null
  }

  // В реальной версии здесь будет декодирование QR-кода
  // Пока что возвращаем заглушку
  return {
    orderId: 'order_' + qrCode.substring(0, 8),
    itemId: 'item_' + qrCode.substring(8, 12),
    index: parseInt(qrCode.substring(12, 16), 16)
  }
}
