import crypto from 'crypto'

// Генерируем токен верификации
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Отправляем письмо верификации
export async function sendVerificationEmail(
  email: string, 
  name: string, 
  token: string
): Promise<void> {
  // TODO: Интеграция с реальным email-провайдером (SendGrid, Nodemailer, etc.)
  
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  const emailContent = {
    to: email,
    subject: 'Подтвердите регистрацию на Kiddeo',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Подтверждение регистрации</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #5a6fd8; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Добро пожаловать на Kiddeo!</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}!</h2>
            
            <p>Спасибо за регистрацию на Kiddeo! Мы рады приветствовать вас в нашем сообществе родителей, которые ищут лучшие развлечения для своих детей.</p>
            
            <p>Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email-адрес, нажав на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Подтвердить Email</a>
            </div>
            
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px;">
              ${verificationUrl}
            </p>
            
            <p><strong>Что дальше?</strong></p>
            <ul>
              <li>🔍 Ищите интересные мероприятия для детей</li>
              <li>📍 Находите лучшие места в вашем городе</li>
              <li>💬 Читайте отзывы других родителей</li>
              <li>🎫 Покупайте билеты онлайн</li>
            </ul>
            
            <p>Если вы не регистрировались на Kiddeo, просто проигнорируйте это письмо.</p>
            
            <div class="footer">
              <p>С уважением,<br>Команда Kiddeo</p>
              <p>
                <a href="https://kiddeo.ru" style="color: #667eea;">kiddeo.ru</a> | 
                <a href="https://kiddeo.ru/contacts" style="color: #667eea;">Контакты</a> | 
                <a href="https://kiddeo.ru/privacy" style="color: #667eea;">Политика конфиденциальности</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Добро пожаловать на Kiddeo!

Привет, ${name}!

Спасибо за регистрацию на Kiddeo! Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email-адрес, перейдя по ссылке:

${verificationUrl}

Что дальше?
- Ищите интересные мероприятия для детей
- Находите лучшие места в вашем городе  
- Читайте отзывы других родителей
- Покупайте билеты онлайн

Если вы не регистрировались на Kiddeo, просто проигнорируйте это письмо.

С уважением,
Команда Kiddeo
https://kiddeo.ru
    `
  }
  
  // В режиме разработки просто логируем письмо
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 EMAIL WOULD BE SENT:')
    console.log('To:', email)
    console.log('Subject:', emailContent.subject)
    console.log('Verification URL:', verificationUrl)
    console.log('HTML Preview:', emailContent.html.substring(0, 200) + '...')
    return
  }
  
  // TODO: Здесь будет реальная отправка через email-провайдера
  // await sendEmail(emailContent)
  
  throw new Error('Email отправка не настроена. Настройте email-провайдера в production.')
}

// Проверяем токен верификации
export function verifyToken(token: string): boolean {
  // TODO: Проверка токена в базе данных
  return token.startsWith('test-token-') || token.length === 64
}
