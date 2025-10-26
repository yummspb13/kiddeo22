'use client'

import React from 'react'
import TicketCalculator from './TicketCalculator'
import { useCart } from '@/contexts/CartContext'

export type TicketItem = {
  id: string | number
  name: string
  price: number
  description?: string
}

interface EventTicketCalculatorProps {
  tickets: TicketItem[]
  eventId: string
  eventTitle: string
  eventImage?: string
  eventDate?: string
  eventLocation?: string
  className?: string
}

export default function EventTicketCalculator({
  tickets,
  eventId,
  eventTitle,
  eventImage,
  eventDate,
  eventLocation,
  className
}: EventTicketCalculatorProps) {
  const { addToCart, updateQuantity, removeFromCart, updateTicketQuantity, state } = useCart()
  
  // Находим билеты этого события в корзине
  const cartItem = state.items.find(item => 
    item.eventId === eventId && item.type === 'ticket' && item.quantity > 0
  )
  
  const isInCart = !!cartItem
  
  // Мемоизируем initialQuantities чтобы избежать бесконечных циклов
  const initialQuantities = React.useMemo(() => {
    if (state.isLoading) return {}
    
    if (cartItem && cartItem.metadata?.tickets) {
      const quantities: Record<string | number, number> = {}
      cartItem.metadata.tickets.forEach((ticket: any) => {
        quantities[ticket.ticketId] = ticket.quantity
      })
      return quantities
    }
    
    return {}
  }, [cartItem, state.isLoading, state.items])
  

  const handleAddToCart = (order: { ticketId: string | number; quantity: number }[], total: number) => {
    // Создаем один CartItem для всего события с массивом билетов
    const eventTickets = order
      .filter(({ quantity }) => quantity > 0)
      .map(({ ticketId, quantity }) => {
        const ticket = tickets.find(t => t.id.toString() === ticketId.toString())
        return ticket ? {
          ticketId,
          quantity,
          name: ticket.name,
          price: ticket.price
        } : null
      })
      .filter(Boolean)
    
    if (eventTickets.length > 0) {
      // Если уже есть билеты этого события в корзине, обновляем их
      if (cartItem) {
        // Обновляем существующий элемент
        const updatedCartItem = {
          ...cartItem,
          price: total,
          metadata: {
            tickets: eventTickets
          }
        }
        // Удаляем старый и добавляем обновленный
        removeFromCart(cartItem.id)
        addToCart(updatedCartItem)
      } else {
        // Создаем новый элемент
        const cartItem = {
          id: eventId, // Используем eventId как уникальный ID
          type: 'ticket' as const,
          eventId,
          title: eventTitle,
          description: 'Билеты на мероприятие',
          price: total, // Общая сумма всех билетов
          quantity: 1, // Один блок мероприятия
          image: eventImage || '',
          vendor: 'Организатор мероприятия',
          date: eventDate || '',
          time: '',
          location: eventLocation || '',
          ageGroup: '',
          metadata: {
            tickets: eventTickets // Массив билетов внутри
          }
        }
        addToCart(cartItem)
      }
    } else if (cartItem) {
      // Если нет билетов, но есть элемент в корзине, удаляем его
      removeFromCart(cartItem.id)
    }
  }

  const handleCheckout = (order: { ticketId: string | number; quantity: number }[], total: number) => {
    // Пока просто добавляем в корзину
    handleAddToCart(order, total)
  }

  const handleQuantityChange = (ticketId: string | number, quantity: number) => {
    updateTicketQuantity(eventId, ticketId, quantity);
  };

  return (
    <TicketCalculator
      tickets={tickets}
      onAddToCart={handleAddToCart}
      onCheckout={handleCheckout}
      onQuantityChange={handleQuantityChange}
      isInCart={isInCart}
      initialQuantities={initialQuantities}
      className={className}
    />
  )
}