import { Unbounded } from 'next/font/google';
import prisma from '@/lib/db';
import Link from 'next/link';
import SmartSearch from '@/components/SmartSearch';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const sp = await searchParams;
  
  // Временно убираем Prisma запрос для диагностики
  const cities = [
    { slug: 'moskva', name: 'Москва' },
    { slug: 'sankt-peterburg', name: 'Санкт-Петербург' }
  ];

  const allSlugs = new Set(cities.map((c) => c.slug));
  const slug = sp?.city && allSlugs.has(sp.city) ? sp.city : (cities[0]?.slug ?? 'moskva');
  const city = cities.find((c) => c.slug === slug) ?? cities[0] ?? { slug: 'moskva', name: 'Москва' };

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 overflow-hidden">
        {/* Shimmer эффект для фона */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer-bright"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Найдите идеальное развлечение для вашего ребенка</h1>
          <p className="text-xl mb-8">Тысячи мероприятий, мест и услуг для детей в вашем городе</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <SmartSearch selectedCity={city.slug} />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Popular Events */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Популярные события</h2>
            <Link href={`/city/${slug}/cat/events`} className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">Все события</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">🎪</div>
                  <div className="text-lg font-semibold">Цирк на льду</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Цирк на льду "Снежная королева"</h3>
                <p className="text-gray-600 text-sm mb-3">Спектакль на льду для всей семьи</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 1500 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Купить билет
                  </button>
                </div>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">🎭</div>
                  <div className="text-lg font-semibold">Детский театр</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">"Золушка" в детском театре</h3>
                <p className="text-gray-600 text-sm mb-3">Классическая сказка для детей</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 800 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Купить билет
                  </button>
                </div>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">🎨</div>
                  <div className="text-lg font-semibold">Мастер-класс</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Рисование песком для детей</h3>
                <p className="text-gray-600 text-sm mb-3">Творческий мастер-класс</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 1200 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Записаться
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Places */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Популярные места</h2>
            <Link href={`/city/${slug}/cat/venues`} className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">Все места</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Place Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🏰</div>
                  <div className="text-lg font-semibold">Детский городок</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Парк "Сказка"</h3>
                <p className="text-gray-600 text-sm mb-3">Развлекательный парк для детей</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city?.name}, Сокольники
                </div>
              </div>
            </div>

            {/* Place Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎪</div>
                  <div className="text-lg font-semibold">Цирк</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Цирк Никулина</h3>
                <p className="text-gray-600 text-sm mb-3">Легендарный цирк на Цветном бульваре</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city?.name}, Цветной бульвар
                </div>
              </div>
            </div>

            {/* Place Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-lg font-semibold">Музей</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Музей космонавтики</h3>
                <p className="text-gray-600 text-sm mb-3">Интерактивный музей для детей</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city?.name}, ВДНХ
                </div>
              </div>
            </div>

            {/* Place Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🏊</div>
                  <div className="text-lg font-semibold">Аквапарк</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Аквапарк "Карибия"</h3>
                <p className="text-gray-600 text-sm mb-3">Водные развлечения для всей семьи</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city?.name}, ТРЦ "Европолис"
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Популярные услуги</h2>
            <Link href={`/city/${slug}/cat/parties`} className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">Все услуги</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎂</div>
                  <div className="text-lg font-semibold">Организация праздников</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Детские дни рождения</h3>
                <p className="text-gray-600 text-sm mb-3">Полная организация праздника</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 5000 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Заказать
                  </button>
                </div>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">👶</div>
                  <div className="text-lg font-semibold">Няня на час</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Профессиональная няня</h3>
                <p className="text-gray-600 text-sm mb-3">Присмотр за детьми</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 800 ₽/час</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Заказать
                  </button>
                </div>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-lg font-semibold">Фотосессия</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Детская фотосессия</h3>
                <p className="text-gray-600 text-sm mb-3">Профессиональная съемка</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">От 3000 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Заказать
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Категории</h2>
            <Link href={`/city/${slug}/cat/events`} className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">Все категории</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Category 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="font-semibold">Театры</h3>
            </div>

            {/* Category 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎪</div>
              <h3 className="font-semibold">Цирки</h3>
            </div>

            {/* Category 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold">Музеи</h3>
            </div>

            {/* Category 4 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏊</div>
              <h3 className="font-semibold">Аквапарки</h3>
            </div>

            {/* Category 5 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎂</div>
              <h3 className="font-semibold">Праздники</h3>
            </div>

            {/* Category 6 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="font-semibold">Концерты</h3>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Полезные статьи</h2>
            <Link href="/blog" className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">Все статьи</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blog Post 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-lg font-semibold">Образование</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Как выбрать кружок для ребенка</h3>
                <p className="text-gray-600 text-sm mb-3">Советы по выбору дополнительного образования</p>
                <div className="text-sm text-gray-500">15 сентября 2025</div>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🍎</div>
                  <div className="text-lg font-semibold">Здоровье</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Здоровое питание для детей</h3>
                <p className="text-gray-600 text-sm mb-3">Рекомендации по детскому питанию</p>
                <div className="text-sm text-gray-500">12 сентября 2025</div>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-lg font-semibold">Развлечения</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Топ-10 мест для детей в {city?.name}</h3>
                <p className="text-gray-600 text-sm mb-3">Лучшие места для семейного отдыха</p>
                <div className="text-sm text-gray-500">10 сентября 2025</div>
              </div>
            </div>
          </div>
        </section>
    </main>
    </div>
  );
}
