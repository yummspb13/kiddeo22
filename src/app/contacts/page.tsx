import { Unbounded } from 'next/font/google';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

export default function ContactsPage() {
  const contactInfo = {
    phone: '+7 (495) 123-45-67',
    email: 'info@kidsreview.ru',
    address: 'Москва, ул. Примерная, 123, офис 456',
    workingHours: 'Пн-Пт: 9:00-18:00, Сб-Вс: 10:00-16:00'
  };

  const departments = [
    {
      name: 'Общие вопросы',
      phone: '+7 (495) 123-45-67',
      email: 'info@kidsreview.ru',
      description: 'По всем вопросам работы платформы'
    },
    {
      name: 'Техническая поддержка',
      phone: '+7 (495) 123-45-68',
      email: 'support@kidsreview.ru',
      description: 'Помощь с использованием сайта и приложения'
    },
    {
      name: 'Партнерство',
      phone: '+7 (495) 123-45-69',
      email: 'partners@kidsreview.ru',
      description: 'Для партнеров и поставщиков услуг'
    },
    {
      name: 'Реклама',
      phone: '+7 (495) 123-45-70',
      email: 'ads@kidsreview.ru',
      description: 'Размещение рекламы на платформе'
    }
  ];

  const socialMedia = [
    { name: 'ВКонтакте', url: '#', icon: 'VK', color: 'bg-blue-600' },
    { name: 'Telegram', url: '#', icon: 'TG', color: 'bg-blue-500' },
    { name: 'Одноклассники', url: '#', icon: 'OK', color: 'bg-orange-500' },
    { name: 'YouTube', url: '#', icon: 'YT', color: 'bg-red-600' }
  ];

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Контакты</h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Свяжитесь с нами</h2>
            
            {/* Main Contact Info */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Телефон</div>
                    <div className="text-gray-600">{contactInfo.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Email</div>
                    <div className="text-gray-600">{contactInfo.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Адрес</div>
                    <div className="text-gray-600">{contactInfo.address}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Часы работы</div>
                    <div className="text-gray-600">{contactInfo.workingHours}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-4">Мы в соцсетях</h3>
              <div className="flex gap-3">
                {socialMedia.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className={`w-12 h-12 ${social.color} text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
                  >
                    <span className="text-sm font-bold">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Напишите нам</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Выберите тему</option>
                  <option value="general">Общие вопросы</option>
                  <option value="support">Техническая поддержка</option>
                  <option value="partnership">Партнерство</option>
                  <option value="advertising">Реклама</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Опишите ваш вопрос или предложение..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Отправить сообщение
              </button>
            </form>
          </div>
        </div>

        {/* Departments */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Отделы и специалисты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <div key={dept.name} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-bold mb-3">{dept.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Тел:</span> {dept.phone}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {dept.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Как нас найти</h2>
          <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg">Карта будет добавлена позже</p>
              <p className="text-sm">{contactInfo.address}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
