// src/app/admin/afisha/ads/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
import { Megaphone, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Calendar, MapPin, TrendingUp, DollarSign, Layout, Grid, Star, Target, Image, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import HeroSlotsTable from '@/components/admin/HeroSlotsTable'

export const dynamic = 'force-dynamic'

export default async function AfishaAdsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)
  
  // В dev режиме, если k пустой, используем ключ по умолчанию
  const adminKey = k ? k.replace('?', '') : 'key=kidsreview2025'
  
  console.log('Debug: sp =', sp, 'k =', k, 'adminKey =', adminKey)

  // Получаем активную вкладку из URL параметров
  const activeTab = (sp.tab as string) || 'HERO_BELOW'
  
  // Валидируем активную вкладку
  const validTabs = ['HERO_BELOW', 'HEADER_BANNER', 'SIDEBAR', 'INLINE']
  const currentTab = validTabs.includes(activeTab) ? activeTab : 'HERO_BELOW'

  // Получаем рекламные слоты из базы данных, фильтруем по активной вкладке
  // Только для AdPlacement вкладок (не для HERO_BELOW)
  const adPlacementTabs = ['HEADER_BANNER', 'SIDEBAR', 'INLINE']
  const adPlacements = adPlacementTabs.includes(currentTab) ? await prisma.adPlacement.findMany({
    where: { 
      page: 'afisha',
      position: currentTab
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ],
    include: {
      City: true,
      AdEvent: {
        where: { type: 'IMPRESSION' },
        select: { id: true }
      }
    }
  }) : []

  // Получаем HeroSlots для вкладки HERO_BELOW
  const heroSlots = currentTab === 'HERO_BELOW' ? await prisma.heroSlot.findMany({
    orderBy: { createdAt: 'desc' }
  }) : []

  // Получаем города
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  // Получаем общую статистику по всем позициям (только для AdPlacement)
  const allAdPlacements = adPlacementTabs.includes(currentTab) ? await prisma.adPlacement.findMany({
    where: { page: 'afisha' },
    include: {
      AdEvent: {
        where: { type: 'IMPRESSION' },
        select: { id: true }
      }
    }
  }) : []

  // Статистика по текущей позиции
  let currentPositionAds, currentPositionActiveAds, currentPositionImpressions, currentPositionClicks, currentPositionCTR
  
  if (currentTab === 'HERO_BELOW') {
    // Статистика для HeroSlots
    currentPositionAds = heroSlots.length
    currentPositionActiveAds = heroSlots.filter(slot => slot.isActive).length
    currentPositionImpressions = heroSlots.reduce((sum, slot) => sum + slot.viewCount, 0)
    currentPositionClicks = heroSlots.reduce((sum, slot) => sum + slot.clickCount, 0)
    currentPositionCTR = currentPositionImpressions > 0 ? (currentPositionClicks / currentPositionImpressions * 100) : 0
  } else {
    // Статистика для AdPlacements
    currentPositionAds = adPlacements.length
    currentPositionActiveAds = adPlacements.filter(ad => ad.isActive).length
    currentPositionImpressions = adPlacements.reduce((sum, ad) => sum + ad.AdEvent.length, 0)
    currentPositionClicks = 0 // Для AdPlacements пока нет кликов
    currentPositionCTR = 0 // Для AdPlacements пока нет CTR
  }

  // Общая статистика
  const totalAds = allAdPlacements.length
  const activeAds = allAdPlacements.filter(ad => ad.isActive).length
  const totalImpressions = allAdPlacements.reduce((sum, ad) => sum + ad.AdEvent.length, 0)

  const positionLabels = {
    'HEADER_BANNER': 'Полоска над событиями (70px)',
    'HERO_BELOW': 'Под главным баннером',
    'SIDEBAR': 'Слева под фильтрами (400x260px)',
    'INLINE': 'Внутри контента (400x150px)'
  }

  const positionIcons = {
    'HEADER_BANNER': Layout,
    'HERO_BELOW': Star,
    'SIDEBAR': Grid,
    'INLINE': Target
  }

  const tabs = [
    { id: 'HERO_BELOW', label: 'Херо категории', icon: Star },
    { id: 'HEADER_BANNER', label: 'Полоска над событиями', icon: Layout },
    { id: 'SIDEBAR', label: 'Слева под фильтрами', icon: Grid },
    { id: 'INLINE', label: 'Внутри контента', icon: Target }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Megaphone className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Рекламные слоты афиши</h1>
        </div>
        <Link
              href={`/admin/afisha/ads/create${k}&position=${activeTab}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
              <Plus className="h-4 w-4 mr-2" />
              Создать рекламный слот
        </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Link
              key={tab.id}
              href={`/admin/afisha/ads${k}&tab=${tab.id}`}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Link>
          )
        })}
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Активных</p>
                <p className="text-2xl font-bold text-gray-900">{currentPositionActiveAds}</p>
                <p className="text-xs text-gray-400">Всего: {activeAds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Показов</p>
                <p className="text-2xl font-bold text-gray-900">{currentPositionImpressions.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Всего: {totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {currentTab === 'HERO_BELOW' ? 'Клики' : 'Доход'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentTab === 'HERO_BELOW' ? currentPositionClicks.toLocaleString() : '₽0'}
                </p>
                <p className="text-xs text-gray-400">
                  {currentTab === 'HERO_BELOW' ? 'Всего кликов' : 'В разработке'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {currentTab === 'HERO_BELOW' ? 'CTR' : 'Слотов в позиции'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentTab === 'HERO_BELOW' ? `${currentPositionCTR.toFixed(1)}%` : currentPositionAds}
                </p>
                <p className="text-xs text-gray-400">
                  {currentTab === 'HERO_BELOW' ? 'Коэффициент кликабельности' : `Всего: ${totalAds}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Placements Table */}
        {currentTab === 'HERO_BELOW' ? (
          <HeroSlotsTable adminKey={adminKey} />
        ) : (
          <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {positionLabels[activeTab as keyof typeof positionLabels]}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentPositionAds} слотов • {currentPositionActiveAds} активных
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Сортировка:</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>По порядку</option>
                  <option>По дате создания</option>
                  <option>По активности</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Реклама
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Позиция
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Город
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Период
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Показы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adPlacements.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.imageUrl ? (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          {ad.hrefUrl && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              {ad.hrefUrl}
                            </div>
                          )}
      </div>
    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {positionLabels[ad.position as keyof typeof positionLabels] || ad.position}
                      </div>
                      <div className="text-sm text-gray-500">Вес: {ad.weight}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ad.City?.name || 'Все города'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ad.startsAt ? new Date(ad.startsAt).toLocaleDateString() : 'Без начала'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString() : 'Без окончания'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ad.AdEvent.length.toLocaleString()}
        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
        <Link
                          href={`/admin/afisha/ads/edit/${ad.id}${k}`}
                          className="text-blue-600 hover:text-blue-900"
        >
                          <Edit className="h-4 w-4" />
        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>

          {adPlacements.length === 0 && (
            <div className="text-center py-12">
              {(() => {
                const Icon = positionIcons[activeTab as keyof typeof positionIcons]
                return <Icon className="mx-auto h-12 w-12 text-gray-400" />
              })()}
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Нет рекламных слотов для {positionLabels[activeTab as keyof typeof positionLabels]}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Создайте первый рекламный слот для этой позиции.
              </p>
              <div className="mt-6">
                <Link
                  href={`/admin/afisha/ads/create${k}&position=${activeTab}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать рекламный слот
                </Link>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Position Guidelines */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Рекомендации по размерам</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Полоска над событиями</h4>
              <p className="text-sm text-gray-600 mb-2">Размер: 70px высота, полная ширина</p>
              <p className="text-sm text-gray-500">Отступы по краям: 16px</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Под главным баннером</h4>
              <p className="text-sm text-gray-600 mb-2">Размер: настраивается</p>
              <p className="text-sm text-gray-500">Между главным баннером и контентом</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Слева под фильтрами</h4>
              <p className="text-sm text-gray-600 mb-2">Размер: 400x260px</p>
              <p className="text-sm text-gray-500">Прямоугольный блок</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Внутри контента</h4>
              <p className="text-sm text-gray-600 mb-2">Размер: 400x150px</p>
              <p className="text-sm text-gray-500">Под билетами, прямоугольный блок</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}