// src/app/admin/afisha/settings/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Settings, Save, RotateCcw, Bell, Globe, Shield, Calendar, Users, DollarSign, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AfishaSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки афиши</h1>
          <p className="text-sm text-gray-600">Общие настройки афиши и системы</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Save className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основные настройки */}
        <div className="lg:col-span-2 space-y-6">
          {/* Общие настройки */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Общие настройки</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название афиши
                </label>
                <input
                  type="text"
                  defaultValue="Афиша детских событий"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  rows={3}
                  defaultValue="Лучшие детские события в вашем городе"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Временная зона
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/London">Лондон (UTC+0)</option>
                  <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoModeration"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="autoModeration" className="ml-2 text-sm text-gray-700">
                  Автоматическая модерация событий
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                  Email уведомления
                </label>
              </div>
            </div>
          </div>

          {/* Настройки событий */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Настройки событий</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимальное количество событий на странице
                </label>
                <input
                  type="number"
                  defaultValue="20"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время модерации (часы)
                </label>
                <input
                  type="number"
                  defaultValue="24"
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимальная цена билета (₽)
                </label>
                <input
                  type="number"
                  defaultValue="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowFreeEvents"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="allowFreeEvents" className="ml-2 text-sm text-gray-700">
                  Разрешить бесплатные события
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
                  Требовать одобрение для публикации
                </label>
              </div>
            </div>
          </div>

          {/* Настройки пользователей */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Настройки пользователей</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимальное количество событий от одного пользователя в день
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowUserRegistration"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="allowUserRegistration" className="ml-2 text-sm text-gray-700">
                  Разрешить регистрацию пользователей
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700">
                  Требовать подтверждение email
                </label>
              </div>
            </div>
          </div>

          {/* Настройки платежей */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Настройки платежей</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комиссия платформы (%)
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  min="0"
                  max="50"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимальная сумма для вывода (₽)
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Период выплат (дни)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="7">Еженедельно</option>
                  <option value="14">Раз в две недели</option>
                  <option value="30">Ежемесячно</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPayouts"
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="autoPayouts" className="ml-2 text-sm text-gray-700">
                  Автоматические выплаты
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Уведомления */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Новые события</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Модерация</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Платежи</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Системные</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
            </div>
          </div>

          {/* Безопасность */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Безопасность</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Двухфакторная аутентификация</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Логирование действий</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">IP-фильтрация</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
            </div>
          </div>

          {/* Аналитика */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Аналитика</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Google Analytics</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Yandex Metrica</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Тепловые карты</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
            </div>
          </div>

          {/* Интеграции */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Интеграции</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Социальные сети</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email рассылки</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">SMS уведомления</span>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
