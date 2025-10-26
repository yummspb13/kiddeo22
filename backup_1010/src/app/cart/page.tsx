'use client'

import { Unbounded } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadCartFromCookie, saveCartToCookie, getCurrentCity, CartItem } from '@/utils/cookies'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'

const unbounded = Unbounded({ subsets: ['latin'] })


export default function CartPage() {
  const { user } = useAuthBridge()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const loadCart = () => {
      try {
        const currentCity = getCurrentCity()
        const loadedCartItems = loadCartFromCookie(currentCity)
          
        // Устанавливаем только если массив не пустой
        if (loadedCartItems && loadedCartItems.length > 0) {
          setCartItems(loadedCartItems)
        } else {
          setCartItems([])
        }
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error)
        setCartItems([])
      } finally {
        setIsLoading(false)
      }
    }

    // Добавляем небольшую задержку, чтобы CartContext успел сохранить данные
    const timer = setTimeout(loadCart, 100)
    return () => clearTimeout(timer)
  }, [isHydrated])

  const removeFromCart = (index: number) => {
    try {
      const newCart = cartItems.filter((_, i) => i !== index)
      setCartItems(newCart)
      
      if (isHydrated) {
        const currentCity = getCurrentCity()
        saveCartToCookie(currentCity, newCart)
      }
    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error)
    }
  }

  const updateTicketQuantity = (itemIndex: number, ticketIndex: number, newQuantity: number) => {
    try {
      console.log('Обновление количества билета:', { itemIndex, ticketIndex, newQuantity })
      const newCart = [...cartItems]
      const item = newCart[itemIndex]
      console.log('Текущий билет:', item.tickets[ticketIndex])
      
      if (newQuantity <= 0) {
        // Удаляем билет из списка
        item.tickets = item.tickets.filter((_, i) => i !== ticketIndex)
        
        // Если билетов не осталось, удаляем весь товар
        if (item.tickets.length === 0) {
          newCart.splice(itemIndex, 1)
        } else {
          // Пересчитываем общую стоимость
          item.total = item.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0)
        }
      } else {
        // Обновляем количество билета
        item.tickets[ticketIndex].quantity = newQuantity
        // Пересчитываем общую стоимость
        item.total = item.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0)
      }
      
      console.log('Обновленный билет:', item.tickets[ticketIndex])
      console.log('Новая общая стоимость товара:', item.total)
      
      setCartItems(newCart)
      
      if (isHydrated) {
        const currentCity = getCurrentCity()
        saveCartToCookie(currentCity, newCart)
      }
    } catch (error) {
      console.error('Ошибка при обновлении количества билетов:', error)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.total || item.price || 0), 0)
  }

  const getTotalTickets = () => {
    return cartItems.reduce((sum, item) => {
      if (item.tickets) {
        // Старый формат
        return sum + item.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0)
      } else if (item.metadata?.tickets) {
        // Новый формат
        return sum + item.metadata.tickets.reduce((ticketSum: number, ticket: any) => ticketSum + ticket.quantity, 0)
      }
      return sum
    }, 0)
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
    const tickets = item.tickets || item.metadata?.tickets || []
    return tickets.some((ticket: any) => !areTicketsSoldOut(ticket))
  }

  // Вычисляем количество баллов (1% от суммы заказа)
  const getTotalPoints = () => {
    const total = getTotalPrice()
    return Math.floor(total * 0.01)
  }
  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold font-unbounded">1</div>
              <span className="ml-2 text-sm font-medium text-green-600 font-unbounded">Выбор билетов</span>
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold font-unbounded">2</div>
              <span className="ml-2 text-sm font-medium text-green-600 font-unbounded">Корзина</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold font-unbounded">3</div>
              <span className="ml-2 text-sm font-medium text-gray-500 font-unbounded">Оформление</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 font-unbounded">
              Ваши билеты ({getTotalTickets()})
            </h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 font-unbounded">Загрузка корзины...</div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 font-unbounded mb-4">Здесь больше нет билетов</div>
                <div className="text-gray-500 font-unbounded mb-4">
                  <Link href="/city/moskva/cat/events" className="text-blue-600 hover:text-blue-700 underline">
                    добавить их заново?
                  </Link>
                </div>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const eventPassed = isEventPassed(item.eventEndDate)
                const hasTickets = hasAvailableTickets(item)
                
                return (
                <div key={index} className={`bg-white rounded-lg shadow-lg p-6 mb-4 ${eventPassed ? 'opacity-50' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <Link 
                      href={item.eventSlug ? `/event/${item.eventSlug}` : '#'} 
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                    >
                      {item.eventImage ? (
                        <img 
                          src={item.eventImage} 
                          alt={item.eventTitle}
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
                        href={item.eventSlug ? `/event/${item.eventSlug}` : '#'}
                        className="text-lg font-semibold mb-2 font-unbounded hover:text-blue-600 transition-colors block"
                      >
                        {item.eventTitle}
                      </Link>
                      {item.eventLocation && (
                        <div className="text-sm text-gray-500 font-unbounded mb-2">
                          <span className="font-medium">Место:</span> {item.eventLocation}
                        </div>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 font-unbounded mb-2">
                        {item.eventDate && <span>Дата: {item.eventDate}</span>}
                        {item.eventTime && <span>Время: {item.eventTime}</span>}
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
                          (item.tickets || item.metadata?.tickets || []).map((ticket: any, ticketIndex: number) => {
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
                                  onClick={() => updateTicketQuantity(index, ticketIndex, ticket.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
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
                                  onClick={() => updateTicketQuantity(index, ticketIndex, ticket.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-unbounded"
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
                      <div className="text-xl font-bold text-red-600 mb-2 font-unbounded">{item.total || item.price || 0} ₽</div>
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-unbounded"
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
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 font-unbounded">Хотите добавить еще билеты?</h3>
              <p className="text-gray-600 mb-4 font-unbounded">Посмотрите другие интересные мероприятия</p>
              <Link href="/city/moskva/cat/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-unbounded inline-block">
                Добавить билеты
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-6 font-unbounded">Сводка заказа</h3>
              
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
                    <span>{isHydrated ? new Date('2024-01-01').toLocaleDateString('ru-RU') : 'Загрузка...'}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 font-unbounded">Стоимость</h4>
                <div className="space-y-2 text-sm font-unbounded">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.eventTitle}</span>
                      <span>{item.total || item.price || 0} ₽</span>
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
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="payment" className="mr-2" defaultChecked />
                    <span className="text-sm font-unbounded">Банковская карта</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="payment" className="mr-2" />
                    <span className="text-sm font-unbounded">СБП</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="payment" className="mr-2" />
                    <span className="text-sm font-unbounded">Наличные курьеру</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold font-unbounded">
                  Оформить заказ
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-unbounded">
                  Сохранить черновик
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6 text-xs text-gray-500 text-center font-unbounded">
                <p>🔒 Безопасная оплата</p>
                <p>Гарантия возврата средств</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Events */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 font-unbounded">Рекомендуем добавить</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recommended Event 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-lg font-semibold font-unbounded">Мастер-классы</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 font-unbounded">Рисование для детей</h3>
                <p className="text-gray-600 text-sm mb-3 font-unbounded">Творческие занятия для развития воображения</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600 font-unbounded">От 800 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-unbounded">
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Event 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎵</div>
                  <div className="text-lg font-semibold font-unbounded">Музыка</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 font-unbounded">Детский концерт</h3>
                <p className="text-gray-600 text-sm mb-3 font-unbounded">Живая музыка для маленьких слушателей</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600 font-unbounded">От 1200 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-unbounded">
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Event 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎪</div>
                  <div className="text-lg font-semibold font-unbounded">Цирк</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 font-unbounded">Цирковое представление</h3>
                <p className="text-gray-600 text-sm mb-3 font-unbounded">Захватывающее шоу для всей семьи</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600 font-unbounded">От 1500 ₽</span>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-unbounded">
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* App Download */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-unbounded">Приложение Kiddeo</h3>
                  <p className="text-sm text-gray-600 mb-4 font-unbounded">Организуйте досуг в несколько кликов</p>
                  <div className="space-y-2">
                    <div className="bg-black text-white px-4 py-2 rounded text-sm font-unbounded">App Store</div>
                    <div className="bg-black text-white px-4 py-2 rounded text-sm font-unbounded">Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 font-unbounded">Разделы</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><Link href="/city/moskva/cat/events" className="hover:text-red-600 font-unbounded">Афиша</Link></li>
                    <li><Link href="/city/moskva/cat/venues" className="hover:text-red-600 font-unbounded">Места</Link></li>
                    <li><Link href="/city/moskva/cat/parties" className="hover:text-red-600 font-unbounded">Праздники</Link></li>
                    <li><Link href="/blog" className="hover:text-red-600 font-unbounded">Блог</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-unbounded">Партнёрам</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><Link href="/vendor" className="hover:text-red-600 font-unbounded">Добавить событие</Link></li>
                    <li><Link href="/vendor/onboarding" className="hover:text-red-600 font-unbounded">Стать партнером</Link></li>
                    <li><Link href="/vendor/leads" className="hover:text-red-600 font-unbounded">Реклама</Link></li>
                    <li><Link href="/vendor/orders" className="hover:text-red-600 font-unbounded">Партнерство</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-unbounded">Помощь</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><Link href="/contacts" className="hover:text-red-600 font-unbounded">Контакты</Link></li>
                    <li><Link href="/help" className="hover:text-red-600 font-unbounded">Поддержка</Link></li>
                    <li><Link href="/faq" className="hover:text-red-600 font-unbounded">FAQ</Link></li>
                    <li><Link href="/privacy-policy" className="hover:text-red-600 font-unbounded">Обратная связь</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-unbounded">Информация</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><Link href="/about" className="hover:text-red-600 font-unbounded">О проекте</Link></li>
                    <li><Link href="/terms" className="hover:text-red-600 font-unbounded">Пользовательское соглашение</Link></li>
                    <li><Link href="/privacy-policy" className="hover:text-red-600 font-unbounded">Политика конфиденциальности</Link></li>
                    <li><Link href="/legal" className="hover:text-red-600 font-unbounded">Правовая информация</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-8 flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-unbounded">Мы в соцсетях:</span>
                <div className="flex space-x-2">
                  <a href="#" className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-unbounded">VK</a>
                  <a href="#" className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-unbounded">TG</a>
                  <a href="#" className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-unbounded">OK</a>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="mt-8 text-sm text-gray-500 font-unbounded">
                <p>© 2025 Kiddeo. Все права защищены.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}