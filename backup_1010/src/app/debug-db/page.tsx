import { prisma } from '@/lib/db'

export default async function DebugDBPage() {
  try {
    // Получаем информацию о таблицах
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `

    // Получаем данные из основных таблиц
    const afishaEvents = await prisma.afishaEvent.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        city: true,
        category: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    })

    const afishaCategories = await prisma.afishaCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        sortOrder: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    const popularEvents = await prisma.popularEvent.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        clickCount: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    })

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">База данных Kiddeo22</h1>
          
          {/* Таблицы */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Таблицы в базе данных</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tables.map((table) => (
                <div key={table.name} className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {table.name}
                </div>
              ))}
            </div>
          </div>

          {/* События афиши */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">События афиши (AfishaEvent)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Просмотры</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Город</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создано</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {afishaEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{event.viewCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Категории афиши */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Категории афиши (AfishaCategory)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активна</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {afishaCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{category.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Да' : 'Нет'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.sortOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Популярные события */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Популярные события (PopularEvent)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Просмотры</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клики</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активно</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создано</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popularEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{event.viewCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{event.clickCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.isActive ? 'Да' : 'Нет'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-8">Ошибка подключения к базе данных</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <pre className="text-sm text-red-800">{String(error)}</pre>
          </div>
        </div>
      </div>
    )
  }
}
