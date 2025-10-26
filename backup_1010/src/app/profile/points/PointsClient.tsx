"use client"

import { useState, useEffect } from 'react'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import { usePoints } from '@/hooks/usePoints'
import { Gift, Star, TrendingUp, History, Award, Info, CheckCircle, Clock, Crown, Sparkles, Zap, Target, Trophy, Coins, ShoppingBag, Users } from 'lucide-react'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-unbounded'
})

interface UserPoints {
  id: number
  points: number
  totalEarned: number
  totalSpent: number
  level: 'NOVICE' | 'ACTIVE' | 'VIP' | 'PLATINUM'
  createdAt: string
  updatedAt: string
}

interface PointsTransaction {
  id: number
  points: number
  type: 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND'
  category: string
  description: string
  createdAt: string
  event?: {
    id: string
    title: string
  }
}

interface Reward {
  id: number
  name: string
  description: string
  pointsCost: number
  type: 'DISCOUNT' | 'FREE_TICKET' | 'GIFT' | 'VIP_STATUS' | 'BONUS_POINTS'
  value: number | null
  isActive: boolean
}

interface UserReward {
  id: number
  pointsSpent: number
  isUsed: boolean
  usedAt: string | null
  createdAt: string
  reward: Reward
}

export default function PointsClient() {
  const { user } = useAuthBridge()
  const { data: pointsData, isLoading, error: pointsError } = usePoints()
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [error, setError] = useState('')
  
  // Пагинация для транзакций
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  // Получаем userId из сессии
  const currentUserId = user?.id

  // Обновляем локальное состояние при изменении данных из React Query
  useEffect(() => {
    if (pointsData) {
      setRewards(pointsData.availableRewards || [])
      setUserRewards(pointsData.usedRewards || [])
    }
  }, [pointsData])

  // Отдельный эффект для загрузки транзакций с пагинацией
  useEffect(() => {
    if (!currentUserId) return

    const fetchTransactions = async () => {
      setTransactionsLoading(true)
      try {
        const response = await fetch(`/api/points/transactions?page=${currentPage}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions)
          setTotalPages(data.totalPages)
          setTotalTransactions(data.totalTransactions)
        } else {
          console.error('Error fetching transactions')
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    fetchTransactions()
  }, [currentUserId, currentPage])

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'NOVICE':
        return { 
          name: 'Новичок', 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          icon: Gift,
          gradient: 'from-gray-400 to-gray-500',
          description: 'Начните зарабатывать баллы!'
        }
      case 'ACTIVE':
        return { 
          name: 'Активный', 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100',
          icon: Zap,
          gradient: 'from-blue-400 to-cyan-500',
          description: 'Отличный прогресс!'
        }
      case 'VIP':
        return { 
          name: 'VIP', 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-100',
          icon: Sparkles,
          gradient: 'from-purple-400 to-pink-500',
          description: 'Вы VIP-клиент!'
        }
      case 'PLATINUM':
        return { 
          name: 'Платиновый', 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          icon: Crown,
          gradient: 'from-yellow-400 to-orange-500',
          description: 'Максимальный уровень!'
        }
      default:
        return { 
          name: 'Новичок', 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          icon: Gift,
          gradient: 'from-gray-400 to-gray-500',
          description: 'Начните зарабатывать баллы!'
        }
    }
  }

  const getNextLevelPoints = (currentLevel: string) => {
    switch (currentLevel) {
      case 'NOVICE': return 1000
      case 'ACTIVE': return 5000
      case 'VIP': return 10000
      case 'PLATINUM': return null
      default: return 1000
    }
  }

  const getProgressPercentage = (points: number, level: string) => {
    const nextLevel = getNextLevelPoints(level)
    if (!nextLevel) return 100
    
    const currentLevelMin = level === 'NOVICE' ? 0 : 
                           level === 'ACTIVE' ? 1000 : 
                           level === 'VIP' ? 5000 : 10000
    
    return Math.min(100, ((points - currentLevelMin) / (nextLevel - currentLevelMin)) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="profile-card p-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="loading-skeleton h-8 w-48 mb-2"></div>
              <div className="loading-skeleton h-4 w-64"></div>
            </div>
            <div className="loading-skeleton h-12 w-24"></div>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-card animate-pulse">
              <div className="loading-skeleton h-4 w-full mb-2"></div>
              <div className="loading-skeleton h-8 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-card p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const levelInfo = pointsData?.userPoints ? getLevelInfo(pointsData.userPoints.level) : getLevelInfo('NOVICE')
  const nextLevelPoints = pointsData?.userPoints ? getNextLevelPoints(pointsData.userPoints.level) : 1000
  const progressPercentage = pointsData?.userPoints ? getProgressPercentage(pointsData.userPoints.points, pointsData.userPoints.level) : 0
  const LevelIcon = levelInfo.icon

  return (
    <div className={`space-y-8 ${unbounded.variable}`}>
      {/* Заголовок с анимацией */}
      <div className="profile-card p-8 animate-fadeInUp">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h1 className="text-4xl font-unbounded-bold text-gradient mb-2">
              Мои баллы лояльности
            </h1>
            <p className="text-lg text-gray-600 font-unbounded-regular">
              Управляйте своими бонусами и получайте награды
          </p>
        </div>
          <div className="relative">
            {/* Красивый фон с градиентом и закругленными углами */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Декоративные элементы */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* Содержимое */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-center">
                  <div className="text-6xl font-unbounded-bold text-white mb-2 animate-glow drop-shadow-lg">
                    {pointsData?.userPoints?.points || 0}
                  </div>
                  <div className="text-lg text-white/90 font-unbounded-medium drop-shadow-md">баллов</div>
                  <div className="text-sm text-white/80 font-unbounded-regular mt-1">
                    {levelInfo.name} уровень
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white animate-float shadow-lg">
                  <Coins className="w-10 h-10 drop-shadow-lg" />
                </div>
              </div>
              
              {/* Блестящий эффект */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика баллов */}
      <div className="stats-grid animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {/* Текущий уровень */}
        <div className="stat-card blue relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${levelInfo.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <LevelIcon className="w-6 h-6 text-white" />
              </div>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">{levelInfo.name}</div>
            <div className="text-sm text-gray-600 mb-2 font-unbounded-regular">{levelInfo.description}</div>
            <div className="text-xs text-blue-600 font-unbounded-medium">Ваш текущий уровень</div>
          </div>
        </div>

        {/* Всего заработано */}
        <div className="stat-card green relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">{pointsData?.userPoints?.totalEarned || 0}</div>
            <div className="text-sm text-gray-600 mb-2 font-unbounded-regular">Всего заработано</div>
            <div className="text-xs text-green-600 font-unbounded-medium">За все время</div>
          </div>
        </div>

        {/* Потрачено */}
        <div className="stat-card red relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-red-600" />
              </div>
              <Coins className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-unbounded-bold text-gray-900 mb-1">{pointsData?.userPoints?.totalSpent || 0}</div>
            <div className="text-sm text-gray-600 mb-2 font-unbounded-regular">Потрачено баллов</div>
            <div className="text-xs text-red-600 font-unbounded-medium">На награды</div>
          </div>
        </div>
      </div>

      {/* Прогресс до следующего уровня */}
      {nextLevelPoints && (
        <div className="profile-card p-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-unbounded-bold text-gray-900">Прогресс до следующего уровня</h3>
            <div className="text-right">
              <div className="text-2xl font-unbounded-bold text-blue-600">
                {pointsData?.userPoints?.points || 0} / {nextLevelPoints}
              </div>
              <div className="text-sm text-gray-600 font-unbounded-regular">баллов</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600 font-unbounded-regular">0</span>
              <span className="text-sm font-unbounded-medium text-blue-600">
                {Math.round(progressPercentage)}% завершено
              </span>
              <span className="text-sm text-gray-600 font-unbounded-regular">{nextLevelPoints}</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-center text-gray-700 font-unbounded-regular">
              До следующего уровня осталось <span className="font-unbounded-bold text-blue-600">
                {nextLevelPoints - (pointsData?.userPoints?.points || 0)}
              </span> баллов
            </p>
          </div>
        </div>
      )}

      {/* Подсказки о получении баллов */}
      <div className="profile-card p-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-2xl font-unbounded-bold text-gray-900 mb-6 flex items-center">
          <Info className="w-6 h-6 mr-3 text-blue-600" />
          Как получить больше баллов?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
                <div>
              <p className="font-unbounded-semibold text-gray-900 mb-1">Написать отзыв</p>
              <p className="text-sm text-gray-600 mb-2 font-unbounded-regular">+10 баллов за каждый отзыв</p>
              <div className="text-xs text-green-600 font-unbounded-medium">Легко получить</div>
                </div>
              </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
                <div>
              <p className="font-unbounded-semibold text-gray-900 mb-1">Оценить место/событие</p>
              <p className="text-sm text-gray-600 mb-2 font-unbounded-regular">+5 баллов за каждую оценку</p>
              <div className="text-xs text-blue-600 font-unbounded-medium">Быстро и просто</div>
                </div>
              </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
                <div>
              <p className="font-unbounded-semibold text-gray-900 mb-1">Покупать билеты</p>
              <p className="text-sm text-gray-600 mb-2 font-unbounded-regular">+1 балл за каждый рубль</p>
              <div className="text-xs text-yellow-600 font-unbounded-medium">Максимальная выгода</div>
                </div>
              </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-unbounded-semibold text-gray-900 mb-1">Пригласить друга</p>
              <p className="text-sm text-gray-600 mb-2 font-unbounded-regular">+200 баллов за регистрацию друга</p>
              <div className="text-xs text-purple-600 font-unbounded-medium">Большой бонус</div>
            </div>
            </div>
          </div>
        </div>

      {/* Доступные награды */}
      <div className="profile-card p-8 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-2xl font-unbounded-bold text-gray-900 mb-6 flex items-center">
          <Award className="w-6 h-6 mr-3 text-yellow-600" />
          Доступные награды
        </h3>
        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward, index) => (
              <div key={reward.id} className="profile-card-interactive p-6 group" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-unbounded-bold text-gray-900 text-lg">{reward.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="text-xl font-unbounded-bold text-yellow-600">{reward.pointsCost}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 font-unbounded-regular">{reward.description}</p>
                <button className="btn-primary w-full group-hover:scale-105 transition-transform font-unbounded-medium">
                  <Gift className="w-4 h-4 mr-2" />
                  Получить награду
              </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-12 h-12 text-gray-400" />
        </div>
            <h4 className="text-xl font-unbounded-semibold text-gray-900 mb-2">Пока нет доступных наград</h4>
            <p className="text-gray-600 mb-6 font-unbounded-regular">
              Заработайте больше баллов, чтобы получить доступ к наградам
            </p>
            <button className="btn-secondary font-unbounded-medium">
              <Target className="w-4 h-4 mr-2" />
              Как заработать баллы
            </button>
          </div>
        )}
        </div>

      {/* История транзакций */}
      <div className="profile-card p-8 animate-fadeInUp" style={{ animationDelay: '1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-unbounded-bold text-gray-900 flex items-center">
            <History className="w-6 h-6 mr-3 text-gray-600" />
            История операций
          </h3>
          <div className="text-sm text-gray-500 font-unbounded-regular">
            {totalTransactions} операций
          </div>
        </div>
        
        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'EARNED' ? 'bg-green-100' : 
                      transaction.type === 'SPENT' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {transaction.type === 'EARNED' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : transaction.type === 'SPENT' ? (
                        <Gift className="w-6 h-6 text-red-600" />
                      ) : (
                        <Star className="w-6 h-6 text-blue-600" />
                      )}
                      </div>
                      <div>
                      <p className="font-unbounded-semibold text-gray-900 text-lg">{transaction.description}</p>
                      <p className="text-sm text-gray-600 font-unbounded-regular">
                        {new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      {transaction.event && (
                        <p className="text-xs text-blue-600 mt-1 font-unbounded-regular">Событие: {transaction.event.title}</p>
                      )}
                      </div>
                    </div>
                    <div className="text-right">
                    <div className={`text-2xl font-unbounded-bold ${
                      transaction.type === 'EARNED' ? 'text-green-600' : 
                      transaction.type === 'SPENT' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'EARNED' ? '+' : ''}{transaction.points}
                      </div>
                    <div className="text-xs text-gray-500 font-unbounded-regular">
                      {transaction.type === 'EARNED' ? 'Заработано' : 
                       transaction.type === 'SPENT' ? 'Потрачено' : 'Бонус'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium"
                >
                  Назад
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md font-unbounded-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium"
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-unbounded-semibold text-gray-900 mb-2">Пока нет операций</h4>
            <p className="text-gray-600 mb-6 font-unbounded-regular">
              Ваши операции с баллами будут отображаться здесь
            </p>
            <button className="btn-secondary font-unbounded-medium">
              <Target className="w-4 h-4 mr-2" />
              Начать зарабатывать баллы
            </button>
          </div>
        )}
        </div>
    </div>
  )
}