// src/app/api/admin/settings/test/[serviceId]/route.ts - Тестирование сервисов
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'
import { sendEmail } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем права администратора
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { service } = await request.json()
    const { serviceId } = params

    let result: { success: boolean; message?: string; error?: string }

    switch (serviceId) {
      case 'cloudinary':
        result = await testCloudinary(service)
        break
      
      case 'email':
        result = await testEmail(service)
        break
      
      case 'payments':
        result = await testPayments(service)
        break
      
      case 'dadata':
        result = await testDaData(service)
        break
      
      case 'yandex-maps':
        result = await testYandexMaps(service)
        break
      
      case 'openai':
        result = await testOpenAI(service)
        break
      
      case 'yookassa':
        result = await testYooKassa(service)
        break
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown service' 
        }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error testing service:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Тестирование Cloudinary
async function testCloudinary(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { cloudName, apiKey, apiSecret } = service.config

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: 'Не все параметры заполнены' }
    }

    // Проверяем конфигурацию
    if (!isCloudinaryConfigured()) {
      return { success: false, error: 'Cloudinary не настроен' }
    }

    // Создаем тестовое изображение (1x1 пиксель PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    // Пытаемся загрузить тестовое изображение
    const result = await uploadToCloudinary(testImageBuffer, {
      folder: 'kiddeo/test',
      public_id: `test_${Date.now()}`
    })

    // Удаляем тестовое изображение
    try {
      await prisma.systemSettings.updateMany({
        where: { key: 'cloudinary.testImageId' },
        data: { value: result.public_id }
      })
    } catch (error) {
      console.warn('Could not save test image ID:', error)
    }

    return { 
      success: true, 
      message: `Тест успешен! Изображение загружено: ${result.public_id}` 
    }

  } catch (error) {
    console.error('Cloudinary test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование Email
async function testEmail(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { provider, fromEmail } = service.config

    if (!fromEmail) {
      return { success: false, error: 'Email отправителя не указан' }
    }

    // Отправляем тестовое письмо
    const testResult = await sendEmail({
      to: fromEmail, // Отправляем себе
      subject: '🧪 Тест Email сервиса - Kiddeo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Тест Email сервиса успешен!</h2>
          <p>Это тестовое письмо подтверждает, что настройки email сервиса работают корректно.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Детали теста:</h3>
            <ul style="color: #6b7280;">
              <li><strong>Провайдер:</strong> ${provider}</li>
              <li><strong>Отправитель:</strong> ${fromEmail}</li>
              <li><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</li>
            </ul>
          </div>
          
          <p>Если вы получили это письмо, значит email сервис настроен правильно!</p>
          <p>С уважением,<br>Система Kiddeo</p>
        </div>
      `
    })

    if (testResult.success) {
      return { 
        success: true, 
        message: `Тест успешен! Письмо отправлено на ${fromEmail}` 
      }
    } else {
      return { 
        success: false, 
        error: `Ошибка отправки: ${testResult.error}` 
      }
    }

  } catch (error) {
    console.error('Email test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование Payments (API Точки)
async function testPayments(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { apiUrl, clientId, clientSecret } = service.config

    if (!apiUrl || !clientId || !clientSecret) {
      return { success: false, error: 'Не все параметры заполнены' }
    }

    // Пока что просто проверяем доступность API
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientId}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 секунд таймаут
      })

      if (response.ok) {
        return { 
          success: true, 
          message: 'API Точки доступен. Полная интеграция будет добавлена позже.' 
        }
      } else {
        return { 
          success: false, 
          error: `API недоступен. Статус: ${response.status}` 
        }
      }
    } catch (fetchError) {
      return { 
        success: false, 
        error: `Ошибка подключения к API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }
    }

  } catch (error) {
    console.error('Payments test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование DaData
async function testDaData(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { apiKey, secretKey } = service.config

    if (!apiKey || !secretKey) {
      return { success: false, error: 'Не все параметры заполнены' }
    }

    // Тестируем API DaData
    try {
      const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'X-Secret': secretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'Москва',
          count: 1
        }),
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()
        return { 
          success: true, 
          message: `DaData работает! Найдено адресов: ${data.suggestions?.length || 0}` 
        }
      } else {
        return { 
          success: false, 
          error: `DaData API недоступен. Статус: ${response.status}` 
        }
      }
    } catch (fetchError) {
      return { 
        success: false, 
        error: `Ошибка подключения к DaData: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }
    }

  } catch (error) {
    console.error('DaData test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование Яндекс Карт
async function testYandexMaps(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { apiKey } = service.config

    if (!apiKey) {
      return { success: false, error: 'API ключ не указан' }
    }

    // Тестируем геокодирование
    try {
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=Москва&format=json`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()
        const found = data.response?.GeoObjectCollection?.featureMember?.length || 0
        return { 
          success: true, 
          message: `Яндекс Карты работают! Найдено объектов: ${found}` 
        }
      } else {
        return { 
          success: false, 
          error: `Яндекс Карты API недоступен. Статус: ${response.status}` 
        }
      }
    } catch (fetchError) {
      return { 
        success: false, 
        error: `Ошибка подключения к Яндекс Картам: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }
    }

  } catch (error) {
    console.error('Yandex Maps test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование OpenAI
async function testOpenAI(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { apiKey, model } = service.config

    if (!apiKey) {
      return { success: false, error: 'API ключ не указан' }
    }

    // Тестируем OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: 'Привет! Это тест API.' }
          ],
          max_tokens: 50
        }),
        signal: AbortSignal.timeout(30000) // 30 секунд для ИИ
      })

      if (response.ok) {
        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content || 'Нет ответа'
        return { 
          success: true, 
          message: `OpenAI работает! Ответ: "${reply.substring(0, 50)}..."` 
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          success: false, 
          error: `OpenAI API недоступен. Статус: ${response.status}. ${errorData.error?.message || ''}` 
        }
      }
    } catch (fetchError) {
      return { 
        success: false, 
        error: `Ошибка подключения к OpenAI: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }
    }

  } catch (error) {
    console.error('OpenAI test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Тестирование YOOKASSA
async function testYooKassa(service: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!service.enabled) {
      return { success: false, error: 'Сервис отключен' }
    }

    const { shopId, secretKey } = service.config

    if (!shopId || !secretKey) {
      return { success: false, error: 'Не все параметры заполнены' }
    }

    // Тестируем YOOKASSA API
    try {
      const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
      const response = await fetch('https://api.yookassa.ru/v3/me', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()
        return { 
          success: true, 
          message: `YOOKASSA работает! Магазин: ${data.account_id || 'Неизвестно'}` 
        }
      } else {
        return { 
          success: false, 
          error: `YOOKASSA API недоступен. Статус: ${response.status}` 
        }
      }
    } catch (fetchError) {
      return { 
        success: false, 
        error: `Ошибка подключения к YOOKASSA: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
      }
    }

  } catch (error) {
    console.error('YooKassa test failed:', error)
    return { 
      success: false, 
      error: `Ошибка тестирования: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
