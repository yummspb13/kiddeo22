// src/components/Footer.tsx
import Link from 'next/link';
// Убираем импорт шрифта, используем CSS переменную напрямую

type City = { slug: string; name: string };
type Props = { citySlug?: string };

export default function Footer({ citySlug = 'moskva' }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white" style={{ fontFamily: 'var(--font-unbounded)' }}>
      <div className="w-full px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold text-red-500 mb-4 hover:text-red-400 transition-colors block cursor-pointer">Kiddeo</Link>
            <p className="text-gray-400 mb-6">
              Единая платформа с мероприятиями, услугами и местами для детей в вашем городе.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">VK</span>
              </a>
              <a href="#" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">TG</span>
              </a>
              <a href="#" className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">OK</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Разделы</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/city/${citySlug}/cat/events`} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Афиша
                </Link>
              </li>
              <li>
                <Link href={`/city/${citySlug}/cat/venues`} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Места
                </Link>
              </li>
              <li>
                <Link href={`/city/${citySlug}/cat/parties`} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Праздники
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Партнёрам</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/vendor" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Кабинет вендора
                </Link>
              </li>
              <li>
                <Link href="/vendor/onboarding" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Добавить компанию
                </Link>
              </li>
              <li>
                <Link href="/vendor/leads" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Лиды
                </Link>
              </li>
              <li>
                <Link href="/vendor/orders" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Заказы
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Помощь
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {year} Kiddeo. Все права защищены.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
