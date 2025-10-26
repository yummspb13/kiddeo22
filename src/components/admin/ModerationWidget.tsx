// src/components/admin/ModerationWidget.tsx
interface ModerationItem {
  id: number
  title: string
  type: 'listing' | 'vendor' | 'lead'
  status: 'pending' | 'needs_revision' | 'rejected'
  createdAt: Date
  city?: string
  category?: string
}

interface ModerationWidgetProps {
  title: string
  items: ModerationItem[]
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onView?: (id: number) => void
}

export default function ModerationWidget({ 
  title, 
  items, 
  onApprove, 
  onReject, 
  onView 
}: ModerationWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'needs_revision': return 'bg-orange-100 text-orange-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На проверке'
      case 'needs_revision': return 'Нужны правки'
      case 'rejected': return 'Отклонено'
      default: return status
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">{items.length} шт.</span>
      </div>
      
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Нет элементов для модерации</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                  {item.city && (
                    <span className="text-xs text-gray-500">{item.city}</span>
                  )}
                  {item.category && (
                    <span className="text-xs text-gray-500">• {item.category}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {item.createdAt.toLocaleDateString('ru-RU')}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {onView && (
                  <button
                    onClick={() => onView(item.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Просмотр
                  </button>
                )}
                {onApprove && item.status === 'pending' && (
                  <button
                    onClick={() => onApprove(item.id)}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    ✓
                  </button>
                )}
                {onReject && item.status === 'pending' && (
                  <button
                    onClick={() => onReject(item.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    ✗
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {items.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Показать все ({items.length})
          </button>
        </div>
      )}
    </div>
  )
}
