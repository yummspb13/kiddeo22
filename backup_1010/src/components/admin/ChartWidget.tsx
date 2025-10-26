// src/components/admin/ChartWidget.tsx
interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

interface ChartWidgetProps {
  title: string
  data: ChartDataPoint[]
  type: 'line' | 'bar' | 'area'
  color?: string
  height?: number
}

export default function ChartWidget({ 
  title, 
  data, 
  type = 'line', 
  color = '#3B82F6',
  height = 200 
}: ChartWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-gray-500">Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  // Простая SVG визуализация
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((point.value - minValue) / range) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Сетка */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* График */}
          {type === 'line' && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
          )}
          
          {type === 'area' && (
            <>
              <polygon
                fill={color}
                fillOpacity="0.1"
                points={`0,100 ${points} 100,100`}
              />
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
              />
            </>
          )}
          
          {type === 'bar' && (
            data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const barHeight = ((point.value - minValue) / range) * 80
              const barWidth = 100 / data.length * 0.8
              return (
                <rect
                  key={index}
                  x={x - barWidth/2}
                  y={100 - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  opacity="0.7"
                />
              )
            })
          )}
          
          {/* Точки данных */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((point.value - minValue) / range) * 80
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="hover:r-4 transition-all"
              />
            )
          })}
        </svg>
        
        {/* Подписи осей */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index} className="text-center">
              {point.label || new Date(point.date).toLocaleDateString('ru-RU', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          ))}
        </div>
      </div>
      
      {/* Легенда */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-gray-600">Значение</span>
        </div>
        <div className="text-gray-500">
          {minValue} - {maxValue}
        </div>
      </div>
    </div>
  )
}
