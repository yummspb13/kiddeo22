import { prisma } from '@/lib/db';
import PopularCategoriesClient from './PopularCategoriesClient';

export default async function PopularCategoriesPage() {
  try {
    // Получаем все города
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { name: 'asc' }
    });

    // Получаем все популярные категории
    const categories = await prisma.popularCategory.findMany({
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { cityId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return (
      <div className="min-h-screen bg-gray-50 font-unbounded">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-unbounded">Популярные категории</h1>
            <p className="mt-2 text-gray-600">
              Управление популярными категориями для каждого города
            </p>
          </div>

          <PopularCategoriesClient 
            initialCities={cities}
            initialCategories={categories}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading popular categories:', error);
    
    // Fallback с пустыми данными
    return (
      <div className="min-h-screen bg-gray-50 font-unbounded">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-unbounded">Популярные категории</h1>
            <p className="mt-2 text-gray-600">
              Управление популярными категориями для каждого города
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 font-unbounded">
                  Ошибка загрузки данных
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Не удалось загрузить данные из базы данных. Проверьте подключение к базе данных.</p>
                </div>
              </div>
            </div>
          </div>

          <PopularCategoriesClient 
            initialCities={[]}
            initialCategories={[]}
          />
        </div>
      </div>
    );
  }
}
