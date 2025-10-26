'use client'

import { Unbounded } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import RecommendedEventsCarousel from '@/components/RecommendedEventsCarousel'

const unbounded = Unbounded({ subsets: ['latin'] })


export default function CartPage() {
  const { user } = useAuthBridge()
  const { state, removeFromCart, updateQuantity, forceLoadCart, addToCart } = useCart()
  const [isHydrated, setIsHydrated] = useState(false)
  const [showDraftSaved, setShowDraftSaved] = useState(false)

  // Добавляем стили для красивых чекбоксов
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .payment-radio {
        transition: all 0.2s ease;
      }
      
      input[type="radio"]:checked ~ .payment-radio {
        border-color: #2563eb;
        background-color: #2563eb;
      }
      
      input[type="radio"]:checked ~ .payment-radio .payment-radio-dot {
        opacity: 1;
        transform: scale(1);
      }
      
      .payment-radio-dot {
        transition: all 0.2s ease;
        transform: scale(0);
      }
      
      input[type="radio"]:checked ~ span {
        color: #1f2937;
        font-weight: 600;
      }
      
      label:hover .payment-radio {
        border-color: #3b82f6;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Принудительно загружаем корзину при монтировании страницы
  useEffect(() => {
    if (isHydrated && state.items.length === 0 && !state.isLoading) {
      forceLoadCart()
    }
  }, [isHydrated, state.items.length, state.isLoading, forceLoadCart])


  const cartItems = state.items
  const isLoading = state.isLoading
  

  const handleRemoveFromCart = (index: number) => {
    try {
      const item = cartItems[index]
      if (item) {
        removeFromCart(item.id)
      }
    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error)
    }
  }

  const handleUpdateTicketQuantity = (itemIndex: number, ticketIndex: number, newQuantity: number) => {
    try {
      console.log('Обновление количества билета:', { itemIndex, ticketIndex, newQuantity })
      const item = cartItems[itemIndex]
      
      if (!item || !item.metadata?.tickets) return
      
      const tickets = [...item.metadata.tickets]
      const ticket = tickets[ticketIndex]
      
      if (!ticket) return
      
      if (newQuantity <= 0) {
        // Удаляем билет из списка
        tickets.splice(ticketIndex, 1)
        
        // Если билетов не осталось, удаляем весь товар
        if (tickets.length === 0) {
          removeFromCart(item.id)
          return
        }
      } else {
        // Обновляем количество билета
        tickets[ticketIndex] = { ...ticket, quantity: newQuantity }
      }
      
      // Обновляем количество товара
      const totalQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
      updateQuantity(item.id, totalQuantity)
      
    } catch (error) {
      console.error('Ошибка при обновлении количества билетов:', error)
    }
  }

  const getTotalPrice = () => {
    return state.total
  }

  const getTotalTickets = () => {
    return cartItems.reduce((total, item) => {
      if (item.metadata?.tickets) {
        return total + item.metadata.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
      }
      return total + item.quantity
    }, 0)
  }

  const handleSaveDraft = () => {
    // Сохраняем корзину на 60 дней
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 60)
    
    // Сохраняем в localStorage с новой датой истечения
    const cartData = {
      items: cartItems,
      total: getTotalPrice(),
      itemCount: getTotalTickets(),
      expiresAt: expirationDate.toISOString()
    }
    
    localStorage.setItem('cart', JSON.stringify(cartData))
    
    // Показываем уведомление
    setShowDraftSaved(true)
    
    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      setShowDraftSaved(false)
    }, 3000)
  }

  // Проверяем, прошло ли событие
  const isEventPassed = (eventEndDate?: string) => {
    if (!eventEndDate || !isHydrated) return false
    try {
      const endDate = new Date(eventEndDate)
      // Используем статическую дату для предотвращения проблем с гидратацией
      const now = new Date('2024-01-01') // Заменим на актуальную дату при необходимости
      return endDate < now
    } catch {
      return false
    }
  }

  // Проверяем, закончились ли билеты
  const areTicketsSoldOut = (ticket: { quantity: number; maxQuantity?: number }) => {
    if (!ticket.maxQuantity) return false
    return ticket.quantity >= ticket.maxQuantity
  }

  // Проверяем, есть ли билеты в наличии
  const hasAvailableTickets = (item: any) => {
    const tickets = item.metadata?.tickets || []
    return tickets.some((ticket: any) => !areTicketsSoldOut(ticket))
  }

  // Вычисляем количество баллов (1% от суммы заказа)
  const getTotalPoints = () => {
    const total = getTotalPrice()
    return Math.floor(total * 0.01)
  }
  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Корзина</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Progress Steps - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold font-unbounded">1</div>
              <span className="ml-2 text-xs md:text-sm font-medium text-green-600 font-unbounded hidden sm:block">Выбор билетов</span>
            </div>
            <div className="w-8 md:w-16 h-1 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold font-unbounded">2</div>
              <span className="ml-2 text-xs md:text-sm font-medium text-green-600 font-unbounded hidden sm:block">Корзина</span>
            </div>
            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs md:text-sm font-bold font-unbounded">3</div>
              <span className="ml-2 text-xs md:text-sm font-medium text-gray-500 font-unbounded hidden sm:block">Оформление</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold font-unbounded">
              Ваши билеты ({getTotalTickets()})
            </h2>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 font-unbounded">Загрузка корзины...</div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="text-gray-500 font-unbounded mb-4 text-lg">Здесь больше нет билетов</div>
                <div className="text-gray-500 font-unbounded mb-6">
                  <Link href="/moscow/events" className="text-blue-600 hover:text-blue-700 underline">
                    добавить их заново?
                  </Link>
                </div>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const eventPassed = isEventPassed(item.date)
                const hasTickets = hasAvailableTickets(item)
                
                return (
                <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 ${eventPassed ? 'opacity-50' : ''}`}>
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    <div className="space-y-4">
                      {/* Photo */}
                      <div>
                        <Link 
                          href={item.eventId ? `/event/${item.eventId}` : '#'} 
                          className="w-full h-32 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity block"
                        >
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-2xl">🎫</span>
                            </div>
                          )}
                        </Link>
                      </div>
                      
                      {/* Event Details */}
                      <div className="space-y-3">
                        <Link 
                          href={item.eventId ? `/event/${item.eventId}` : '#'}
                          className="text-base font-semibold font-unbounded hover:text-blue-600 transition-colors block"
                        >
                          {item.title}
                        </Link>
                        {item.location && (
                          <div className="text-sm text-gray-500 font-unbounded">
                            {item.location}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 font-unbounded">
                          {item.date && <div>Дата: {item.date}</div>}
                        </div>
                        <div className="space-y-2">
                          {eventPassed ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                              <div className="text-red-600 font-semibold font-unbounded">
                                Мероприятие уже прошло
                              </div>
                            </div>
                          ) : !hasTickets ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                              <div className="text-orange-600 font-semibold font-unbounded">
                                Билеты закончились
                              </div>
                            </div>
                          ) : (
                            (item.metadata?.tickets || []).map((ticket: any, ticketIndex: number) => {
                              const ticketSoldOut = areTicketsSoldOut(ticket)
                              
                              return (
                              <div key={ticketIndex} className={`flex items-center justify-between rounded-lg p-3 ${ticketSoldOut ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800 font-unbounded">
                                    {ticket.name || `Билет ${ticket.ticketId}`}
                                  </div>
                                  {ticketSoldOut ? (
                                    <div className="text-sm text-orange-600 font-unbounded">
                                      Билеты закончились
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-sm text-gray-500 font-unbounded">
                                        {ticket.price} ₽ за билет
                                      </div>
                                      <div className="text-sm text-gray-900 font-unbounded">
                                        Всего: {ticket.price * ticket.quantity} ₽
                                      </div>
                                    </>
                                  )}
                                </div>
                              {!ticketSoldOut && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateTicketQuantity(index, ticketIndex, ticket.quantity - 1)}
                                    className="w-7 h-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
                                  >
                                    {ticket.quantity === 1 ? (
                                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    ) : (
                                      '−'
                                    )}
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium font-unbounded">
                                    {ticket.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateTicketQuantity(index, ticketIndex, ticket.quantity + 1)}
                                    className="w-7 h-7 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                            )
                          })
                          )}
                        </div>
                        
                        {/* Price and Delete Row */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-center text-lg font-bold text-red-600 font-unbounded">
                            {item.price * item.quantity} ₽
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-unbounded py-2 px-3 border border-red-300 rounded hover:bg-red-50"
                          >
                            Удалить все
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-start space-x-4">
                    <Link 
                      href={item.eventId ? `/event/${item.eventId}` : '#'} 
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                    >
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-2xl">🎫</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <Link 
                        href={item.eventId ? `/event/${item.eventId}` : '#'}
                        className="text-lg font-semibold mb-2 font-unbounded hover:text-blue-600 transition-colors block"
                      >
                        {item.title}
                      </Link>
                      {item.location && (
                        <div className="text-sm text-gray-500 font-unbounded mb-2">
                          <span className="font-medium">Место:</span> {item.location}
                        </div>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 font-unbounded mb-2">
                        {item.date && <span>Дата: {item.date}</span>}
                        {item.time && <span>Время: {item.time}</span>}
                      </div>
                      <div className="mt-3 space-y-2">
                        {eventPassed ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div className="text-red-600 font-semibold font-unbounded">
                              Мероприятие уже прошло
                            </div>
                          </div>
                        ) : !hasTickets ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                            <div className="text-orange-600 font-semibold font-unbounded">
                              Билеты закончились
                            </div>
                          </div>
                        ) : (
                          (item.metadata?.tickets || []).map((ticket: any, ticketIndex: number) => {
                            const ticketSoldOut = areTicketsSoldOut(ticket)
                            
                            return (
                            <div key={ticketIndex} className={`flex items-center justify-between rounded-lg p-3 ${ticketSoldOut ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800 font-unbounded">
                                  {ticket.name || `Билет ${ticket.ticketId}`}
                                </div>
                                {ticketSoldOut ? (
                                  <div className="text-sm text-orange-600 font-unbounded">
                                    Билеты закончились
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-sm text-gray-500 font-unbounded">
                                      {ticket.price} ₽ за билет
                                    </div>
                                    <div className="text-sm text-gray-900 font-unbounded">
                                      Всего: {ticket.price * ticket.quantity} ₽
                                    </div>
                                  </>
                                )}
                              </div>
                            {!ticketSoldOut && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateTicketQuantity(index, ticketIndex, ticket.quantity - 1)}
                                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
                                >
                                  {ticket.quantity === 1 ? (
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  ) : (
                                    '−'
                                  )}
                                </button>
                                <span className="w-8 text-center text-sm font-medium font-unbounded">
                                  {ticket.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateTicketQuantity(index, ticketIndex, ticket.quantity + 1)}
                                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                          )
                        })
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg md:text-xl font-bold text-red-600 mb-2 font-unbounded">{item.price * item.quantity} ₽</div>
                      <button 
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-600 hover:text-red-700 text-xs md:text-sm font-unbounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
                )
              })
            )}

            {/* Add More Events */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center">
              <h3 className="text-base md:text-lg font-semibold mb-2 font-unbounded">Хотите добавить еще билеты?</h3>
              <p className="text-gray-600 mb-4 font-unbounded text-sm md:text-base">Посмотрите другие интересные мероприятия</p>
              <Link href="/moscow/events" className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-unbounded block text-sm md:text-base mx-auto w-fit flex items-center justify-center">
                Добавить билеты
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 sticky top-8">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 font-unbounded">Сводка заказа</h3>
              
              {/* Event Details */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 font-unbounded">Детали заказа</h4>
                <div className="space-y-2 text-sm font-unbounded">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Событий:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Билетов:</span>
                    <span>{getTotalTickets()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата заказа:</span>
                    <span>{isHydrated ? new Date().toLocaleDateString('ru-RU') : 'Загрузка...'}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 font-unbounded">Стоимость</h4>
                <div className="space-y-2 text-sm font-unbounded">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex-1 pr-2">{item.title}</span>
                      <span className="whitespace-nowrap">{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Сервисный сбор</span>
                    <span>{Math.floor(getTotalPrice() * 0.05)} ₽</span>
                  </div>
                  {getTotalPrice() > 1000 && (
                    <div className="flex justify-between">
                      <span>Скидка 5%</span>
                      <span className="text-green-600">-{Math.floor(getTotalPrice() * 0.05)} ₽</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold font-unbounded">
                    <span>Итого:</span>
                    <span>{getTotalPrice() + Math.floor(getTotalPrice() * 0.05) - (getTotalPrice() > 1000 ? Math.floor(getTotalPrice() * 0.05) : 0)} ₽</span>
                  </div>
                  
                  {/* Блок с баллами */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 font-unbounded">
                            {user ? 'Зачислится баллов:' : 'Получите баллов:'}
                          </div>
                          <div className="text-xs text-gray-600 font-unbounded">
                            {user ? '1% от суммы заказа' : 'Войдите в аккаунт для начисления'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600 font-unbounded">
                          {getTotalPoints()}
                        </div>
                        <div className="text-xs text-gray-500 font-unbounded">
                          баллов
                        </div>
                      </div>
                    </div>
                    
                    {!user && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <div className="flex space-x-3">
                          <Link 
                            href="/auth/signin"
                            className="flex-1 text-center py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium font-unbounded text-sm"
                          >
                            Войти
                          </Link>
                          <Link 
                            href="/auth/register"
                            className="flex-1 text-center py-2 px-4 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium font-unbounded text-sm"
                          >
                            Зарегистрироваться
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 font-unbounded">Способы оплаты</h4>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="sr-only" 
                      defaultChecked 
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center payment-radio">
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 payment-radio-dot"></div>
                    </div>
                    <span className="ml-3 text-sm font-unbounded text-gray-700">Банковская карта</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="sr-only" 
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center payment-radio">
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 payment-radio-dot"></div>
                    </div>
                    <span className="ml-3 text-sm font-unbounded text-gray-700">СБП</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="sr-only" 
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center payment-radio">
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 payment-radio-dot"></div>
                    </div>
                    <span className="ml-3 text-sm font-unbounded text-gray-700">Наличные курьеру</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white py-3 md:py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold font-unbounded text-sm md:text-base">
                  Оформить заказ
                </button>
                <button 
                  onClick={handleSaveDraft}
                  className="w-full bg-gray-100 text-gray-700 py-3 md:py-3 rounded-lg hover:bg-gray-200 transition-colors font-unbounded text-sm md:text-base"
                >
                  Сохранить черновик
                </button>
              </div>

              {/* Draft Saved Notification */}
              {showDraftSaved && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-700 font-unbounded text-sm">
                    ✅ Корзина сохранена на 60 дней
                  </p>
                </div>
              )}

              {/* Security Info */}
              <div className="mt-6 text-xs text-gray-500 text-center font-unbounded">
                <p>🔒 Безопасная оплата</p>
                <p>Гарантия возврата средств</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Events */}
        <RecommendedEventsCarousel citySlug="moscow" />
      </main>

    </div>
  )
}