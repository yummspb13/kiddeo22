// src/components/admin/MetricsCard.tsx
interface MetricsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  description?: string
}

export default function MetricsCard({ title, value, change, icon, description }: MetricsCardProps) {
  const changeColor = change?.type === 'increase' 
    ? 'text-green-600' 
    : change?.type === 'decrease' 
    ? 'text-red-600' 
    : 'text-gray-600'

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColor}`}>
              {change.type === 'increase' ? '↗' : change.type === 'decrease' ? '↘' : '→'} {Math.abs(change.value)}%
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
