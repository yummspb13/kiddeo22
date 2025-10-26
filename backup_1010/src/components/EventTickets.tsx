'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TicketCalculator from './TicketCalculator'
import { saveCartToCookie, getCurrentCity, loadCartFromCookie, CartItem } from '@/utils/cookies'

type EventTicketsProps = {
  tickets: Array<{ name?: string; price?: number; quantity?: number }>
  buyUrl?: string
  eventTitle?: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  eventImage?: string
  eventSlug?: string
  eventEndDate?: string
}

export default function EventTickets({ tickets, buyUrl, eventTitle, eventDate, eventTime, eventLocation, eventImage, eventSlug, eventEndDate }: EventTicketsProps) {
  const router = useRouter()
  const [cartTickets, setCartTickets] = useState<Record<string | number, number>>({})
  const [isInCart, setIsInCart] = useState(false)

  // Функция для обновления состояния корзины
  const updateCartState = () => {
    try {
      if (typeof window !== 'undefined' && eventSlug) {
        const currentCity = getCurrentCity()
        const cartItems = loadCartFromCookie(currentCity)
        
        // Ищем текущее событие в корзине
        const currentEvent = cartItems.find(item => item.eventSlug === eventSlug)
        
        if (currentEvent) {
          console.log('Найдено событие в корзине:', currentEvent)
          setIsInCart(true)
          // Преобразуем билеты из корзины в формат для TicketCalculator
          const ticketsFromCart: Record<string | number, number> = {}
          currentEvent.tickets.forEach(ticket => {
            ticketsFromCart[ticket.ticketId] = ticket.quantity
          })
          console.log('Билеты из корзины для TicketCalculator:', ticketsFromCart)
          setCartTickets(ticketsFromCart)
        } else {
          console.log('Событие не найдено в корзине')
          setIsInCart(false)
          setCartTickets({})
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке билетов из корзины:', error)
    }
  }

  // Загружаем уже добавленные билеты из корзины
  useEffect(() => {
    updateCartState()
  }, [eventSlug])

  // Также обновляем состояние при монтировании компонента
  useEffect(() => {
    updateCartState()
  }, [])

  // Слушаем изменения корзины
  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartState()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdate)
      return () => window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [eventSlug])

  const handleAddToCart = (order: { ticketId: string | number; quantity: number }[], total: number) => {
    console.log('Добавить в корзину:', { order, total })
    
    try {
      // Проверяем доступность localStorage
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage недоступен')
        router.push('/cart')
        return
      }
      
      // Сохраняем данные о событии и билетах в localStorage для корзины
      console.log('Данные события для корзины:', { eventTitle, eventImage, eventSlug })
      const cartItem = {
        eventTitle: eventTitle || 'Событие',
        eventDate: eventDate || '',
        eventTime: eventTime || '',
        eventLocation: eventLocation || '',
        eventImage: eventImage || '',
        eventSlug: eventSlug || '',
        eventEndDate: eventEndDate || '',
        tickets: order.map(ticketOrder => {
          // ticketId в order соответствует индексу в массиве tickets
          const ticketIndex = Number(ticketOrder.ticketId) - 1
          const ticket = tickets[ticketIndex]
          console.log('Обработка билета:', { ticketOrder, ticketIndex, ticket, tickets })
            return {
              ...ticketOrder,
              name: ticket?.name || `Билет ${ticketOrder.ticketId}`,
              price: ticket?.price || 0,
              maxQuantity: ticket?.quantity || undefined
            }
        }),
        total: total,
        addedAt: new Date().toISOString()
      }
      
      // Получаем текущий город
      const currentCity = getCurrentCity()
      
      // Загружаем существующую корзину для этого города
      const existingCart = loadCartFromCookie(currentCity)
      
      // Проверяем, есть ли уже это событие в корзине
      const existingEventIndex = existingCart.findIndex(item => item.eventSlug === eventSlug)
      
      if (existingEventIndex >= 0) {
        // Обновляем существующее событие
        existingCart[existingEventIndex] = cartItem
      } else {
        // Добавляем новое событие
        existingCart.push(cartItem)
      }
      
      // Сохраняем корзину в cookie для этого города
      saveCartToCookie(currentCity, existingCart)
      
      // Обновляем локальное состояние
      setIsInCart(true)
      const ticketsFromCart: Record<string | number, number> = {}
      cartItem.tickets.forEach(ticket => {
        ticketsFromCart[ticket.ticketId] = ticket.quantity
      })
      setCartTickets(ticketsFromCart)
      
      // Переходим на страницу корзины
      router.push('/cart')
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error)
      // В случае ошибки все равно переходим на страницу корзины
      router.push('/cart')
    }
  }

  const handleQuickCheckout = (order: { ticketId: string | number; quantity: number }[], total: number, paymentMethod: 'card' | 'sbp') => {
    console.log('Быстрая оплата:', { order, total, paymentMethod })
    // TODO: Реализовать быструю оплату
  }

  if (tickets.length === 0) {
    return <div className="text-sm text-gray-600 font-unbounded">Типы билетов пока не добавлены.</div>
  }

  return (
    <TicketCalculator
      tickets={tickets.map((t, i) => ({
        id: i + 1,
        name: String(t.name || `Тариф ${i + 1}`),
        price: Number(t.price || 0)
      }))}
      buyUrl={buyUrl}
      onAddToCart={handleAddToCart}
      onQuickCheckout={handleQuickCheckout}
      className="mt-2"
      initialQuantities={cartTickets}
      isInCart={isInCart}
    />
  )
}
