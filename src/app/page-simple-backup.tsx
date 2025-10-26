import { Unbounded } from 'next/font/google';
import Link from 'next/link';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

export default function Home() {
  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Найдите идеальное развлечение для вашего ребенка</h1>
          <p className="text-xl mb-8">Тысячи мероприятий, мест и услуг для детей в вашем городе</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Добро пожаловать!</h2>
          <p className="text-lg text-gray-600 mb-8">Сервер работает в режиме диагностики</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Мониторинг</h3>
              <p className="text-gray-600 mb-4">Проверьте состояние системы</p>
              <Link href="/monitor" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Открыть мониторинг
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Админ панель</h3>
              <p className="text-gray-600 mb-4">Управление системой</p>
              <Link href="/admin?key=kidsreview2025" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Открыть админку
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">API Health</h3>
              <p className="text-gray-600 mb-4">Проверка API</p>
              <Link href="/api/health" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Проверить API
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
