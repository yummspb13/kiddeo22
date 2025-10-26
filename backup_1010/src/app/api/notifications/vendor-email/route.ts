import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/notifications/vendor-email - отправить email уведомление вендору
export async function POST(request: NextRequest) {
  try {
    const { vendorId, type, data } = await request.json()

    if (!vendorId || !type) {
      return NextResponse.json({ error: 'Missing vendorId or type' }, { status: 400 })
    }

    // Получаем информацию о вендоре
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Генерируем email в зависимости от типа
    let subject = ''
    let htmlContent = ''

    switch (type) {
      case 'application_approved':
        subject = '🎉 Ваша заявка одобрена!'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">🎉 Поздравляем!</h2>
            <p>Ваша заявка на регистрацию вендора <strong>"${vendor.displayName}"</strong> была одобрена.</p>
            <p>Теперь вы можете:</p>
            <ul>
              <li>Создавать события в афише</li>
              <li>Добавлять места в каталог</li>
              <li>Управлять своими карточками</li>
            </ul>
            <p><a href="${process.env.NEXTAUTH_URL}/vendor/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Перейти в панель вендора</a></p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Если у вас есть вопросы, обращайтесь в поддержку.
            </p>
          </div>
        `
        break

      case 'application_rejected':
        subject = '❌ Заявка требует доработки'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EF4444;">❌ Заявка требует доработки</h2>
            <p>К сожалению, ваша заявка на регистрацию вендора <strong>"${vendor.displayName}"</strong> была отклонена.</p>
            ${data?.reason ? `<p><strong>Причина:</strong> ${data.reason}</p>` : ''}
            <p>Пожалуйста, исправьте указанные замечания и подайте заявку повторно.</p>
            <p><a href="${process.env.NEXTAUTH_URL}/vendor/register" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Подать заявку повторно</a></p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Если у вас есть вопросы, обращайтесь в поддержку.
            </p>
          </div>
        `
        break

      case 'application_needs_info':
        subject = 'ℹ️ Требуется дополнительная информация'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">ℹ️ Требуется дополнительная информация</h2>
            <p>Для рассмотрения вашей заявки на регистрацию вендора <strong>"${vendor.displayName}"</strong> требуется дополнительная информация.</p>
            ${data?.reason ? `<p><strong>Что нужно предоставить:</strong> ${data.reason}</p>` : ''}
            <p>Пожалуйста, предоставьте запрошенную информацию как можно скорее.</p>
            <p><a href="${process.env.NEXTAUTH_URL}/vendor/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Перейти в панель вендора</a></p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Если у вас есть вопросы, обращайтесь в поддержку.
            </p>
          </div>
        `
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Здесь должна быть интеграция с email сервисом (SendGrid, Mailgun, etc.)
    // Пока что просто логируем
    console.log('📧 Email notification:', {
      to: vendor.user.email,
      subject,
      vendorName: vendor.displayName,
      type
    })

    // TODO: Интеграция с реальным email сервисом
    // await sendEmail({
    //   to: vendor.user.email,
    //   subject,
    //   html: htmlContent
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Email notification queued',
      email: {
        to: vendor.user.email,
        subject,
        type
      }
    })

  } catch (error) {
    console.error('Error sending vendor email notification:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
