import nodemailer from 'nodemailer'

// Создаем транспортер для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'KidsReview <noreply@kidsreview.ru>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Убираем HTML теги для текстовой версии
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
    subject: 'Заявка на регистрацию вендора одобрена - KidsReview',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Поздравляем! Заявка одобрена</h2>
        <p>Здравствуйте!</p>
        <p>Ваша заявка на регистрацию вендора <strong>${vendorName}</strong> была одобрена!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #065f46; margin-top: 0;">Теперь вы можете:</h3>
          <ul style="color: #047857;">
            <li>Создавать события для детей</li>
            <li>Управлять своим профилем вендора</li>
            <li>Привлекать новых клиентов</li>
            <li>Использовать все возможности платформы</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/vendor/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Перейти в панель управления
          </a>
        </div>
        
        <p>Добро пожаловать в KidsReview!</p>
        <p>С уважением,<br>Команда KidsReview</p>
      </div>
    `
  }),

  vendorRejected: (vendorName: string, userEmail: string, reason: string) => ({
    subject: 'Заявка на регистрацию вендора отклонена - KidsReview',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Заявка отклонена</h2>
        <p>Здравствуйте!</p>
        <p>К сожалению, ваша заявка на регистрацию вендора <strong>${vendorName}</strong> была отклонена.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-top: 0;">Причина отклонения:</h3>
          <p style="color: #b91c1c;">${reason}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Что можно сделать:</h3>
          <ul style="color: #6b7280;">
            <li>Исправить указанные проблемы</li>
            <li>Подать новую заявку с исправленными данными</li>
            <li>Обратиться в поддержку для уточнения деталей</li>
        </ul>
        </div>
        
        <p>Если у вас есть вопросы, обращайтесь в поддержку.</p>
        <p>С уважением,<br>Команда KidsReview</p>
      </div>
    `
  })
}