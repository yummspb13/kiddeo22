import Link from 'next/link'
import { Settings, Filter, Eye, EyeOff, Building, MapPin, Calendar, Users, UserCheck, MessageSquare, Shield, Bot, BarChart3, Home, FileText, Megaphone, Activity, Star } from 'lucide-react'

interface AdminDashboardProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const params = await searchParams
  const key = params.key as string || ''
  const keySuffix = key ? `?key=${encodeURIComponent(key)}` : ''
  return (
    <div className="min-h-screen bg-gray-50 font-unbounded">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-unbounded">Панель администратора</h1>
          <p className="mt-2 text-gray-600">Управление фильтрами и видимостью разделов</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Настройки сервисов */}
          <Link 
            href={`/admin/settings${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Настройки сервисов</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление интеграциями: Cloudinary, Email, Платежи
            </p>
            <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
              <span>Настроить сервисы</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Главная страница */}
          <Link 
            href={`/admin/homepage${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Главная страница</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление блоками главной страницы и рекламой
            </p>
            <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Афиша */}
          <Link 
            href={`/admin/afisha${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Афиша</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление событиями, фильтрами и настройками афиши
            </p>
            <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Популярные категории */}
          <Link 
            href={`/admin/popular-categories${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-pink-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Megaphone className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Популярные категории</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление популярными категориями для каждого города
            </p>
            <div className="mt-4 flex items-center text-sm text-pink-600 group-hover:text-pink-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Подборки */}
          <Link 
            href={`/admin/collections${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Подборки</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление подборками событий для клиентов
            </p>
            <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Пользователи */}
          <Link 
            href={`/admin/users${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Пользователи</h3>
                <span className="text-sm text-gray-500">12</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Управление пользователями, ролями и правами доступа
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Роли */}
          <Link 
            href={`/admin/roles${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Роли и разрешения</h3>
                <span className="text-sm text-gray-500">9</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Управление ролями пользователей и их разрешениями
            </p>
            <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Вендоры */}
          <Link 
            href={`/admin/vendors${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Вендоры</h3>
                <span className="text-sm text-gray-500">83</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Управление вендорами, их заявками и профилями
            </p>
            <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Модерация заявок на клайм */}
          <Link 
            href={`/admin/listing-claims${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-amber-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Заявки на клайм</h3>
                <span className="text-sm text-gray-500">5</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Модерация заявок вендоров на получение прав на карточки
            </p>
            <div className="mt-4 flex items-center text-sm text-amber-600 group-hover:text-amber-700">
              <span>Перейти к модерации</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Модерация заявок вендоров */}
          <Link 
            href={`/admin/vendor-applications${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Заявки вендоров</h3>
                <span className="text-sm text-gray-500">12</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Модерация заявок на регистрацию вендоров
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
              <span>Перейти к модерации</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Управление документами */}
          <Link 
            href={`/admin/documents${keySuffix}`}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Управление документами</h3>
                <span className="text-sm text-gray-500">8</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Просмотр и модерация документов вендоров
            </p>
            <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
              <span>Перейти к документам</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Аналитика модерации */}
          <Link 
            href={`/admin/moderation-analytics${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Аналитика модерации</h3>
                <span className="text-sm text-gray-500">Отчеты</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Статистика и аналитика по обработке заявок
            </p>
            <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
              <span>Перейти к аналитике</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Журнал аудита */}
          <Link 
            href={`/admin/audit-log${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Журнал аудита</h3>
                <span className="text-sm text-gray-500">Логи</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Отслеживание действий модераторов и пользователей
            </p>
            <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
              <span>Перейти к журналу</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Лиды */}
          <Link 
            href={`/admin/leads${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 font-unbounded">Лиды</h3>
                <span className="text-sm text-gray-500">25</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Управление лидами, заявками и контактами
            </p>
            <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* RBAC */}
          <Link 
            href={`/admin/rbac${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">RBAC</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление ролями, правами доступа и разрешениями
            </p>
            <div className="mt-4 flex items-center text-sm text-red-600 group-hover:text-red-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* ИИ-Ассистент */}
          <Link 
            href={`/admin/assistant${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">ИИ-Ассистент</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Настройка и управление ИИ-ассистентом
            </p>
            <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:text-indigo-700">
              <span>Перейти к настройке</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Места */}
          <Link 
            href={`/admin/venues${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-cyan-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Места</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление фильтрами мест и рекламой
            </p>
            <div className="mt-4 flex items-center text-sm text-cyan-600 group-hover:text-cyan-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Реклама мест */}
          <Link 
            href={`/admin/venues/ads${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Реклама мест</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление рекламными местами в разделах
            </p>
            <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
              <span>Перейти к рекламе</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Предложения мест */}
          <Link 
            href={`/admin/venue-suggestions${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Предложения мест</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Модерация предложений новых мест от пользователей
            </p>
            <div className="mt-4 flex items-center text-sm text-orange-600 group-hover:text-orange-700">
              <span>Перейти к модерации</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Блог */}
          <Link 
            href={`/admin/blog${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Блог</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Управление контентом блога и рекламой
            </p>
            <div className="mt-4 flex items-center text-sm text-emerald-600 group-hover:text-emerald-700">
              <span>Перейти к управлению</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Отзывы */}
          <Link 
            href={`/admin/reviews${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-yellow-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Отзывы</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Ручная и ИИ модерация отзывов для Афиши и Мест
            </p>
            <div className="mt-4 flex items-center text-sm text-yellow-600 group-hover:text-yellow-700">
              <span>Перейти к модерации</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Управление фильтрами */}
          <Link 
            href={`/admin/filters${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <Filter className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Управление фильтрами</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Настройка фильтров для основного раздела "Места", категорий и подкатегорий
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-600 group-hover:text-gray-700">
              <span>Перейти к настройке</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Управление видимостью */}
          <Link 
            href={`/admin/visibility${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Управление видимостью</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Настройка видимости разделов по городам, категориям и подкатегориям
            </p>
            <div className="mt-4 flex items-center text-sm text-emerald-600 group-hover:text-emerald-700">
              <span>Перейти к настройке</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Статистика */}
          <Link 
            href={`/admin/debug${keySuffix}`} 
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 font-unbounded">Статистика и отладка</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Аналитика использования и отладочная информация
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-600 group-hover:text-gray-700">
              <span>Перейти к статистике</span>
              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}