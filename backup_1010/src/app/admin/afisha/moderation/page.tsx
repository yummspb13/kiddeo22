// src/app/admin/afisha/moderation/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Eye, Check, X, Clock, AlertTriangle, MessageSquare, Star, Filter, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AfishaModerationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Моковые данные для модерации
  const mockModerationItems = [
    {
      id: 1,
      type: 'event',
      title: 'Детский спектакль "Красная шапочка"',
      author: 'Театр кукол "Сказка"',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      priority: 'high',
      reason: 'Новое событие требует проверки',
      details: {
        description: 'Спектакль для детей от 3 лет',
        date: '2024-02-01',
        venue: 'Театр кукол "Сказка"',
        price: 600
      }
    },
    {
      id: 2,
      type: 'comment',
      title: 'Комментарий к событию "Мастер-класс по лепке"',
      author: 'Анна Петрова',
      status: 'pending',
      submittedAt: '2024-01-15T14:20:00Z',
      priority: 'medium',
      reason: 'Жалоба на спам',
      details: {
        content: 'Отличный мастер-класс! Рекомендую всем родителям.',
        eventTitle: 'Мастер-класс по лепке',
        reportedBy: 'Иван Сидоров'
      }
    },
    {
      id: 3,
      type: 'review',
      title: 'Отзыв о событии "Концерт детского хора"',
      author: 'Мария Иванова',
      status: 'pending',
      submittedAt: '2024-01-15T16:45:00Z',
      priority: 'low',
      reason: 'Новый отзыв',
      details: {
        rating: 5,
        content: 'Прекрасный концерт! Дети были в восторге.',
        eventTitle: 'Концерт детского хора'
      }
    },
    {
      id: 4,
      type: 'event',
      title: 'Спортивная олимпиада для детей',
      author: 'Спорткомплекс "Олимпийский"',
      status: 'approved',
      submittedAt: '2024-01-14T09:15:00Z',
      priority: 'high',
      reason: 'Одобрено модератором',
      details: {
        description: 'Соревнования для детей 6-12 лет',
        date: '2024-02-15',
        venue: 'Спорткомплекс "Олимпийский"',
        price: 0
      }
    },
    {
      id: 5,
      type: 'comment',
      title: 'Комментарий к событию "Выставка детских работ"',
      author: 'Сергей Козлов',
      status: 'rejected',
      submittedAt: '2024-01-14T11:30:00Z',
      priority: 'high',
      reason: 'Отклонено как спам',
      details: {
        content: 'Купите мои курсы по рисованию! Скидка 50%!',
        eventTitle: 'Выставка детских работ',
        reportedBy: 'Модератор'
      }
    }
  ]

  const stats = {
    pending: mockModerationItems.filter(item => item.status === 'pending').length,
    approved: mockModerationItems.filter(item => item.status === 'approved').length,
    rejected: mockModerationItems.filter(item => item.status === 'rejected').length,
    total: mockModerationItems.length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На модерации'
      case 'approved': return 'Одобрено'
      case 'rejected': return 'Отклонено'
      default: return 'Неизвестно'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Clock className="w-4 h-4" />
      case 'comment': return <MessageSquare className="w-4 h-4" />
      case 'review': return <Star className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация</h1>
          <p className="text-sm text-gray-600">Модерация событий, комментариев и отзывов</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">На модерации</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Одобрено</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Отклонено</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по содержимому..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option value="">Все типы</option>
            <option value="event">События</option>
            <option value="comment">Комментарии</option>
            <option value="review">Отзывы</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option value="">Все статусы</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобрено</option>
            <option value="rejected">Отклонено</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option value="">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </div>

      {/* Список элементов для модерации */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Элементы для модерации</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {mockModerationItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-gray-500">
                      {getTypeIcon(item.type)}
                      <span className="text-sm capitalize">{item.type}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'high' ? 'Высокий' : item.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.reason}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <p><strong>Автор:</strong> {item.author}</p>
                    <p><strong>Дата подачи:</strong> {new Date(item.submittedAt).toLocaleString('ru-RU')}</p>
                  </div>

                  {/* Детали в зависимости от типа */}
                  {item.type === 'event' && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Детали события:</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Описание:</strong> {item.details.description}</div>
                        <div><strong>Дата:</strong> {item.details.date}</div>
                        <div><strong>Место:</strong> {item.details.venue}</div>
                        <div><strong>Цена:</strong> {item.details.price > 0 ? `₽${item.details.price}` : 'Бесплатно'}</div>
                      </div>
                    </div>
                  )}

                  {item.type === 'comment' && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Содержимое комментария:</h5>
                      <p className="text-sm text-gray-700 mb-2">"{item.details.content}"</p>
                      <p className="text-xs text-gray-500">К событию: {item.details.eventTitle}</p>
                      {item.details.reportedBy && (
                        <p className="text-xs text-gray-500">Пожаловался: {item.details.reportedBy}</p>
                      )}
                    </div>
                  )}

                  {item.type === 'review' && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Содержимое отзыва:</h5>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < item.details.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{item.details.rating}/5</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">"{item.details.content}"</p>
                      <p className="text-xs text-gray-500">К событию: {item.details.eventTitle}</p>
                    </div>
                  )}
                </div>

                {/* Действия */}
                <div className="flex items-center gap-2 ml-4">
                  {item.status === 'pending' && (
                    <>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        <Check className="w-4 h-4" />
                        Одобрить
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        <X className="w-4 h-4" />
                        Отклонить
                      </button>
                    </>
                  )}
                  <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                    <Eye className="w-4 h-4" />
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
