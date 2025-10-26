import { Unbounded } from 'next/font/google';
import prisma from '@/lib/db';
import HomePageClient from '@/components/HomePageClient';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const sp = await searchParams;
  
  // Добавляем кэширование для ускорения
  const revalidate = 300; // 5 минут
  
  // Получаем список городов из базы данных
  let cities: { slug: string; name: string }[] = [];
  try {
    const citiesData = await prisma.city.findMany({
      select: {
        slug: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    cities = citiesData;
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Fallback если API недоступен
    cities = [
      { slug: 'moscow', name: 'Москва' },
      { slug: 'saint-petersburg', name: 'Санкт-Петербург' }
    ];
  }

  // Определяем город из URL пути или query параметров
  const pathname = '/'; // Главная страница
  const urlCity = sp?.city ?? undefined;
  
  // Для главной страницы используем query параметр city или дефолт
  const citySlug = urlCity || 'moscow';
  const city = cities.find((c) => c.slug === citySlug) ?? { slug: 'moscow', name: 'Москва' };
  
  // Получаем контент главной страницы
  let homepageContent = {};
  try {
    // Импортируем функции из библиотеки
    const { getBlockContent, getCategories } = await import('@/lib/homepage-content');
    
    // Получаем блоки главной страницы для города
    const blocks = await prisma.homePageBlock.findMany({
      where: { 
        citySlug,
        isVisible: true 
      },
      orderBy: { order: 'asc' }
    });

    const result: any = {};

    // Загружаем все блоки параллельно для ускорения
    const blockPromises = blocks.map(async (block) => {
      try {
        const content = await getBlockContent(block.blockType, citySlug);
        return {
          blockType: block.blockType,
          data: {
            ...block,
            content
          }
        };
      } catch (blockError) {
        console.error('Error processing block', block.blockType, ':', blockError);
        return {
          blockType: block.blockType,
          data: {
            ...block,
            content: []
          }
        };
      }
    });

    // Ждем завершения всех блоков
    const blockResults = await Promise.all(blockPromises);
    
    // Собираем результат
    blockResults.forEach(({ blockType, data }) => {
      result[blockType] = data;
    });

    // Добавляем категории напрямую
    try {
      const categories = await getCategories(citySlug, 8);
      result.CATEGORIES = {
        id: 'categories',
        blockType: 'CATEGORIES',
        citySlug,
        isVisible: true,
        order: 0,
        customTitle: 'Категории',
        customDescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: categories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      result.CATEGORIES = {
        id: 'categories',
        blockType: 'CATEGORIES',
        citySlug,
        isVisible: true,
        order: 0,
        customTitle: 'Категории',
        customDescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: []
      };
    }

    homepageContent = result;
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    homepageContent = {};
  }

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      <HomePageClient
        citySlug={citySlug}
        cityName={city.name}
        initialHomepageContent={homepageContent}
      />
    </div>
  );
}

// Кэшируем страницу на 5 минут
export const revalidate = 300;