// src/lib/email-service.ts - Подготовка для интеграции с SendGrid
import nodemailer from 'nodemailer'

// Конфигурация SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ""
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@kiddeo.ru"

// Альтернативная конфигурация для SMTP (Gmail, etc.)
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

// Основная функция отправки email
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Проверяем конфигурацию
    if (!SENDGRID_API_KEY && !SMTP_CONFIG.auth.user) {
      console.warn('⚠️ Email service not configured. Email would be sent to:', to)
      console.log('Subject:', subject)
      console.log('Content preview:', html?.substring(0, 200) + '...')
      return { success: true, messageId: 'mock-' + Date.now() }
    }

    // Используем SendGrid если настроен
    if (SENDGRID_API_KEY) {
      return await sendViaSendGrid({ to, subject, html, text })
    }

    // Иначе используем SMTP
    return await sendViaSMTP({ to, subject, html, text })

  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Отправка через SendGrid
async function sendViaSendGrid({ to, subject, html, text }: EmailOptions) {
  // Временно отключаем SendGrid для деплоя
  console.log('SendGrid email would be sent:', { to, subject })
  return { 
    success: true, 
    messageId: 'mock-sendgrid-' + Date.now(),
    provider: 'sendgrid'
  }
  
  // TODO: Раскомментировать когда установим @sendgrid/mail
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(SENDGRID_API_KEY)

  const msg = {
    to,
    from: SENDGRID_FROM_EMAIL,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, '') // Убираем HTML теги для текстовой версии
  }

  const response = await sgMail.send(msg)
  console.log('Email sent via SendGrid:', response[0].headers['x-message-id'])
  
  return { 
    success: true, 
    messageId: response[0].headers['x-message-id'],
    provider: 'sendgrid'
  }
  */
}

// Отправка через SMTP
async function sendViaSMTP({ to, subject, html, text }: EmailOptions) {
  const transporter = nodemailer.createTransporter(SMTP_CONFIG)

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `KidsReview <${SMTP_CONFIG.auth.user}>`,
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, '') // Убираем HTML теги для текстовой версии
  })

  console.log('Email sent via SMTP:', info.messageId)
  return { 
    success: true, 
    messageId: info.messageId,
    provider: 'smtp'
  }
}

// Шаблоны email
export const emailTemplates = {
  vendorSubmitted: (vendorName: string, userEmail: string) => ({
    subject: 'Заявка на регистрацию вендора отправлена - KidsReview',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Заявка отправлена!</h2>
        <p>Здравствуйте!</p>
        <p>Мы получили вашу заявку на регистрацию вендора <strong>${vendorName}</strong> в KidsReview.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Что дальше?</h3>
          <ul style="color: #6b7280;">
            <li>Наши модераторы проверят предоставленные документы</li>
            <li>Обычно проверка занимает 1-2 рабочих дня</li>
            <li>Вы получите уведомление о результате на email: ${userEmail}</li>
          </ul>
        </div>
        
        <p>Спасибо за интерес к KidsReview!</p>
        <p>С уважением,<br>Команда KidsReview</p>
      </div>
    `
  }),

  vendorApproved: (vendorName: string, userEmail: string) => ({
    subject: '🎉 Ваша заявка одобрена! - KidsReview',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🎉 Поздравляем!</h2>
        <p>Здравствуйте!</p>
        <p>Ваша заявка на регистрацию вендора <strong>${vendorName}</strong> была одобрена!</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0;">Что дальше?</h3>
          <ul style="color: #047857;">
            <li>Войдите в панель вендора</li>
            <li>Заполните профиль вашего заведения</li>
            <li>Начните добавлять мероприятия и услуги</li>
          </ul>
        </div>
        
        <p><a href="${process.env.NEXTAUTH_URL}/vendor/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Перейти в панель вендора</a></p>
        
        <p>С уважением,<br>Команда KidsReview</p>
      </div>
    `
  }),

  emailVerification: (name: string, verificationUrl: string) => ({
    subject: 'Подтвердите ваш email - KidsReview',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Добро пожаловать на KidsReview!</h2>
        <p>Привет, ${name}!</p>
        <p>Спасибо за регистрацию! Для завершения регистрации подтвердите ваш email-адрес:</p>
        
        <p><a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Подтвердить email</a></p>
        
        <p>Если кнопка не работает, скопируйте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        
        <p>С уважением,<br>Команда KidsReview</p>
      </div>
    `
  })
}

// Экспорт для совместимости с существующим кодом
export { sendEmail as sendEmailLegacy }
