// src/app/api/admin/settings/route.ts - API для настроек сервисов
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

// GET - Получение настроек сервисов
export async function GET(request: NextRequest) {
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

    // Получаем настройки из базы данных
    const settings = await prisma.systemSettings.findMany({
      where: { category: 'services' }
    })

    // Преобразуем в формат для фронтенда
    const servicesConfig = {
      cloudinary: {
        enabled: settings.find(s => s.key === 'cloudinary.enabled')?.value === 'true',
        config: {
          cloudName: settings.find(s => s.key === 'cloudinary.cloudName')?.value || '',
          apiKey: settings.find(s => s.key === 'cloudinary.apiKey')?.value || '',
          apiSecret: settings.find(s => s.key === 'cloudinary.apiSecret')?.value || ''
        }
      },
      email: {
        enabled: settings.find(s => s.key === 'email.enabled')?.value === 'true',
        config: {
          provider: settings.find(s => s.key === 'email.provider')?.value || 'sendgrid',
          sendgridApiKey: settings.find(s => s.key === 'email.sendgridApiKey')?.value || '',
          smtpHost: settings.find(s => s.key === 'email.smtpHost')?.value || '',
          smtpPort: settings.find(s => s.key === 'email.smtpPort')?.value || '587',
          smtpUser: settings.find(s => s.key === 'email.smtpUser')?.value || '',
          smtpPass: settings.find(s => s.key === 'email.smtpPass')?.value || '',
          fromEmail: settings.find(s => s.key === 'email.fromEmail')?.value || 'noreply@kiddeo.ru'
        }
      },
      payments: {
        enabled: settings.find(s => s.key === 'payments.enabled')?.value === 'true',
        config: {
          apiUrl: settings.find(s => s.key === 'payments.apiUrl')?.value || 'https://api.tochka.com',
          clientId: settings.find(s => s.key === 'payments.clientId')?.value || '',
          clientSecret: settings.find(s => s.key === 'payments.clientSecret')?.value || ''
        }
      },
      dadata: {
        enabled: settings.find(s => s.key === 'dadata.enabled')?.value === 'true',
        config: {
          apiKey: settings.find(s => s.key === 'dadata.apiKey')?.value || '',
          secretKey: settings.find(s => s.key === 'dadata.secretKey')?.value || ''
        }
      },
      'yandex-maps': {
        enabled: settings.find(s => s.key === 'yandex-maps.enabled')?.value === 'true',
        config: {
          apiKey: settings.find(s => s.key === 'yandex-maps.apiKey')?.value || ''
        }
      },
      openai: {
        enabled: settings.find(s => s.key === 'openai.enabled')?.value === 'true',
        config: {
          apiKey: settings.find(s => s.key === 'openai.apiKey')?.value || '',
          model: settings.find(s => s.key === 'openai.model')?.value || 'gpt-4',
          maxTokens: settings.find(s => s.key === 'openai.maxTokens')?.value || '1000'
        }
      },
      yookassa: {
        enabled: settings.find(s => s.key === 'yookassa.enabled')?.value === 'true',
        config: {
          shopId: settings.find(s => s.key === 'yookassa.shopId')?.value || '',
          secretKey: settings.find(s => s.key === 'yookassa.secretKey')?.value || ''
        }
      }
    }

    return NextResponse.json({ services: servicesConfig })

  } catch (error) {
    console.error('Error getting settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Сохранение настроек сервисов
export async function POST(request: NextRequest) {
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

    const { services } = await request.json()

    // Сохраняем настройки в базу данных
    const settingsToSave = []

    // Cloudinary
    settingsToSave.push(
      { key: 'cloudinary.enabled', value: services.cloudinary?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'cloudinary.cloudName', value: services.cloudinary?.config?.cloudName || '', category: 'services' },
      { key: 'cloudinary.apiKey', value: services.cloudinary?.config?.apiKey || '', category: 'services' },
      { key: 'cloudinary.apiSecret', value: services.cloudinary?.config?.apiSecret || '', category: 'services' }
    )

    // Email
    settingsToSave.push(
      { key: 'email.enabled', value: services.email?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'email.provider', value: services.email?.config?.provider || 'sendgrid', category: 'services' },
      { key: 'email.sendgridApiKey', value: services.email?.config?.sendgridApiKey || '', category: 'services' },
      { key: 'email.smtpHost', value: services.email?.config?.smtpHost || '', category: 'services' },
      { key: 'email.smtpPort', value: services.email?.config?.smtpPort || '587', category: 'services' },
      { key: 'email.smtpUser', value: services.email?.config?.smtpUser || '', category: 'services' },
      { key: 'email.smtpPass', value: services.email?.config?.smtpPass || '', category: 'services' },
      { key: 'email.fromEmail', value: services.email?.config?.fromEmail || 'noreply@kiddeo.ru', category: 'services' }
    )

    // Payments (API Точки)
    settingsToSave.push(
      { key: 'payments.enabled', value: services.payments?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'payments.apiUrl', value: services.payments?.config?.apiUrl || 'https://api.tochka.com', category: 'services' },
      { key: 'payments.clientId', value: services.payments?.config?.clientId || '', category: 'services' },
      { key: 'payments.clientSecret', value: services.payments?.config?.clientSecret || '', category: 'services' }
    )

    // DaData
    settingsToSave.push(
      { key: 'dadata.enabled', value: services.dadata?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'dadata.apiKey', value: services.dadata?.config?.apiKey || '', category: 'services' },
      { key: 'dadata.secretKey', value: services.dadata?.config?.secretKey || '', category: 'services' }
    )

    // Яндекс Карты
    settingsToSave.push(
      { key: 'yandex-maps.enabled', value: services['yandex-maps']?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'yandex-maps.apiKey', value: services['yandex-maps']?.config?.apiKey || '', category: 'services' }
    )

    // OpenAI
    settingsToSave.push(
      { key: 'openai.enabled', value: services.openai?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'openai.apiKey', value: services.openai?.config?.apiKey || '', category: 'services' },
      { key: 'openai.model', value: services.openai?.config?.model || 'gpt-4', category: 'services' },
      { key: 'openai.maxTokens', value: services.openai?.config?.maxTokens || '1000', category: 'services' }
    )

    // YOOKASSA
    settingsToSave.push(
      { key: 'yookassa.enabled', value: services.yookassa?.enabled ? 'true' : 'false', category: 'services' },
      { key: 'yookassa.shopId', value: services.yookassa?.config?.shopId || '', category: 'services' },
      { key: 'yookassa.secretKey', value: services.yookassa?.config?.secretKey || '', category: 'services' }
    )

    // Используем upsert для каждого параметра
    for (const setting of settingsToSave) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }

    console.log('✅ Settings saved successfully')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
