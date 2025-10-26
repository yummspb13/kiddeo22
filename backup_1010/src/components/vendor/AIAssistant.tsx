// src/components/vendor/AIAssistant.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Target, 
  FileText, 
  Link,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

interface AIAssistantProps {
  vendorId: number
}

interface AIRequest {
  id: number
  type: string
  prompt: string
  response?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
  completedAt?: Date
  tokensUsed?: number
  cost?: number
}

interface AIRecommendation {
  id: number
  type: string
  title: string
  description: string
  priority: number
  isApplied: boolean
  appliedAt?: Date
  createdAt: Date
}

const ASSISTANT_TYPES = [
  {
    type: 'PROMO_ADVICE',
    title: 'Советы по продвижению',
    description: 'Рекомендации по лучшим слотам публикации и времени',
    icon: TrendingUp,
    color: 'bg-blue-500'
  },
  {
    type: 'PRICING_ANALYSIS',
    title: 'Анализ цен',
    description: 'Сравнение с конкурентами и рекомендации по ценообразованию',
    icon: DollarSign,
    color: 'bg-green-500'
  },
  {
    type: 'CONTENT_GENERATION',
    title: 'Генерация контента',
    description: 'Создание описаний, заголовков и текстов',
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    type: 'UTM_GENERATION',
    title: 'UTM-метки',
    description: 'Генерация UTM-меток для рекламных кампаний',
    icon: Link,
    color: 'bg-orange-500'
  },
  {
    type: 'COMPETITOR_ANALYSIS',
    title: 'Анализ конкурентов',
    description: 'Исследование конкурентных карточек и стратегий',
    icon: Target,
    color: 'bg-red-500'
  }
]

export default function AIAssistant({ vendorId }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'assistant' | 'recommendations'>('assistant')
  const [selectedType, setSelectedType] = useState<string>('PROMO_ADVICE')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requests, setRequests] = useState<AIRequest[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])

  useEffect(() => {
    loadRequests()
    loadRecommendations()
  }, [vendorId])

  const loadRequests = async () => {
    // TODO: Загрузить запросы к ИИ с сервера
    const mockRequests: AIRequest[] = [
      {
        id: 1,
        type: 'PROMO_ADVICE',
        prompt: 'Какие лучшие слоты для публикации мастер-класса по рисованию?',
        response: 'Рекомендую публиковать в выходные дни с 10:00 до 12:00 и с 15:00 до 17:00. Это время наибольшей активности родителей с детьми.',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        completedAt: new Date(Date.now() - 1000 * 60 * 25),
        tokensUsed: 150,
        cost: 0.03
      },
      {
        id: 2,
        type: 'PRICING_ANALYSIS',
        prompt: 'Проанализируй цены на мастер-классы в моем городе',
        response: 'Средняя цена мастер-классов по рисованию в вашем городе: 800-1200₽. Рекомендую установить цену 900₽ для привлечения клиентов.',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        tokensUsed: 200,
        cost: 0.04
      }
    ]
    setRequests(mockRequests)
  }

  const loadRecommendations = async () => {
    // TODO: Загрузить рекомендации с сервера
    const mockRecommendations: AIRecommendation[] = [
      {
        id: 1,
        type: 'pricing',
        title: 'Оптимизация цены',
        description: 'Снизьте цену на 10% для увеличения конверсии',
        priority: 4,
        isApplied: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: 2,
        type: 'content',
        title: 'Улучшение описания',
        description: 'Добавьте больше деталей о программе мастер-класса',
        priority: 3,
        isApplied: true,
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
      }
    ]
    setRecommendations(mockRecommendations)
  }

  const handleSubmitRequest = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    
    // TODO: Отправить запрос к ИИ на сервер
    const newRequest: AIRequest = {
      id: Date.now(),
      type: selectedType,
      prompt,
      status: 'PROCESSING',
      createdAt: new Date()
    }
    
    setRequests(prev => [newRequest, ...prev])
    setPrompt('')

    // Симуляция обработки
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === newRequest.id 
          ? {
              ...req,
              status: 'COMPLETED',
              response: 'Это пример ответа ИИ-помощника. В реальной версии здесь будет ответ от OpenAI API.',
              completedAt: new Date(),
              tokensUsed: 100,
              cost: 0.02
            }
          : req
      ))
      setIsLoading(false)
    }, 2000)
  }

  const handleApplyRecommendation = async (id: number) => {
    // TODO: Применить рекомендацию
    setRecommendations(prev => prev.map(rec => 
      rec.id === id 
        ? { ...rec, isApplied: true, appliedAt: new Date() }
        : rec
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-800'
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ИИ-Помощник</h2>
          <p className="text-gray-600">Умные рекомендации для развития вашего бизнеса</p>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assistant'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            ИИ-Помощник
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Рекомендации
          </button>
        </nav>
      </div>

      {/* Контент */}
      {activeTab === 'assistant' ? (
        <div className="space-y-6">
          {/* Выбор типа помощи */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите тип помощи</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ASSISTANT_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedType === type.type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{type.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Форма запроса */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Задайте вопрос ИИ-помощнику</h3>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Опишите, с чем вам нужна помощь..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Стоимость: ~0.02₽ за запрос
                </span>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!prompt.trim() || isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Обработка...' : 'Отправить запрос'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* История запросов */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">История запросов</h3>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium text-gray-900">
                        {ASSISTANT_TYPES.find(t => t.type === request.type)?.title}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.createdAt.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 font-medium">Вопрос:</p>
                    <p className="text-gray-600">{request.prompt}</p>
                  </div>

                  {request.response && (
                    <div className="mb-3">
                      <p className="text-gray-700 font-medium">Ответ:</p>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{request.response}</p>
                    </div>
                  )}

                  {request.tokensUsed && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Токенов использовано: {request.tokensUsed}</span>
                      <span>Стоимость: {request.cost}₽</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Рекомендации */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Умные рекомендации</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        Приоритет {rec.priority}
                      </span>
                      {rec.isApplied && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Применено
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rec.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                  <p className="text-gray-600 mb-4">{rec.description}</p>
                  
                  {!rec.isApplied && (
                    <button
                      onClick={() => handleApplyRecommendation(rec.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Применить рекомендацию
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
