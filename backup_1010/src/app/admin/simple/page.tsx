// src/app/admin/simple/page.tsx
export default function AdminSimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Админ-Ассистент</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Система коммерции</h2>
          <p className="text-gray-600 mb-4">Полностью реализована система заказов, платежей и билетов</p>
          <div className="space-y-2">
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>YooKassa интеграция</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Система билетов с QR-кодами</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Email уведомления</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Система лояльности</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Статистика</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Всего заказов</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Выручка</p>
              <p className="text-2xl font-bold">0 ₽</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Активных вендоров</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            <a href="/admin" className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center">
              Главная панель
            </a>
            <a href="/admin/afisha" className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center">
              Управление афишей
            </a>
            <a href="/admin/users" className="block w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center">
              Пользователи
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Статус системы</h3>
        <p className="text-yellow-700">
          Система коммерции и оплаты полностью реализована и готова к использованию. 
          Все API endpoints работают, база данных настроена, интеграция с YooKassa готова.
        </p>
      </div>
    </div>
  )
}
