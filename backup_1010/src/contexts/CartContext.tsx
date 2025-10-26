'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveCartToCookie, loadCartFromCookie, getCurrentCity } from '@/utils/cookies';

// Типы для корзины
export interface CartItem {
  id: string;
  type: 'ticket' | 'product';
  eventId?: string;
  productId?: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  vendor: string;
  date?: string;
  time?: string;
  location?: string;
  ageGroup?: string;
  maxQuantity?: number;
  metadata?: Record<string, any>;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
  isAnimating: boolean;
  lastAddedItem?: CartItem;
  isLoading: boolean;
}

// Действия корзины
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_ANIMATING'; payload: boolean }
  | { type: 'SET_LAST_ADDED'; payload: CartItem | undefined }
  | { type: 'SET_LOADING'; payload: boolean };

// Начальное состояние
const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  itemCount: 0,
  isAnimating: false,
  lastAddedItem: undefined,
  isLoading: true,
};

// Редьюсер корзины
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        lastAddedItem: action.payload,
        isAnimating: true,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        lastAddedItem: undefined,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'SET_ANIMATING':
      return {
        ...state,
        isAnimating: action.payload,
      };

    case 'SET_LAST_ADDED':
      return {
        ...state,
        lastAddedItem: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Контекст корзины
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateTicketQuantity: (eventId: string, ticketId: string | number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
} | null>(null);

// Провайдер корзины
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [mounted, setMounted] = React.useState(false);

  // Устанавливаем mounted после монтирования компонента
  useEffect(() => {
    setMounted(true);
  }, []);

  // Загружаем корзину из cookies при инициализации
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const currentCity = getCurrentCity();
      console.log('CartContext: Loading cart for city:', currentCity);
      
      // Сначала пробуем загрузить из localStorage
      const savedCart = localStorage.getItem(`cart_${currentCity}`);
      console.log('CartContext: Saved cart from localStorage:', savedCart);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('CartContext: Parsed cart:', parsedCart);
        if (parsedCart.items && parsedCart.items.length > 0) {
          console.log('CartContext: Loading items from localStorage:', parsedCart.items);
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: 'ADD_ITEM', payload: item });
          });
          return;
        }
      }
      
      // Если в localStorage нет, загружаем из cookies
      const cookieCart = loadCartFromCookie(currentCity);
      console.log('CartContext: Cookie cart:', cookieCart);
      if (cookieCart && cookieCart.length > 0) {
        // Конвертируем старый формат в новый
        cookieCart.forEach((oldItem: any) => {
          if (oldItem.tickets && oldItem.tickets.length > 0) {
            // Создаем один CartItem для всего события
            const cartItem: CartItem = {
              id: oldItem.eventSlug || oldItem.eventTitle,
              type: 'ticket',
              eventId: oldItem.eventSlug, // Используем eventSlug как eventId
              title: oldItem.eventTitle,
              description: 'Билеты на мероприятие',
              price: oldItem.total,
              quantity: 1,
              image: oldItem.eventImage,
              vendor: 'Организатор мероприятия',
              date: oldItem.eventDate,
              time: oldItem.eventTime,
              location: oldItem.eventLocation,
              ageGroup: '',
              metadata: {
                tickets: oldItem.tickets
              }
            };
            dispatch({ type: 'ADD_ITEM', payload: cartItem });
          }
        });
        
        // Очищаем старые данные из cookies после конвертации
        const cartKey = `cart_${currentCity}`;
        document.cookie = `${cartKey}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage/cookies:', error);
    } finally {
      // Загрузка завершена
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [mounted]);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const currentCity = getCurrentCity();
      // Сохраняем корзину в localStorage
      
      // Сохраняем только один раз в localStorage
      const cartData = {
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`cart_${currentCity}`, JSON.stringify(cartData));
      
      // Также сохраняем в cookies для совместимости (только если есть изменения)
      if (state.items.length > 0) {
        const oldFormatItems = state.items.map(item => ({
          eventTitle: item.title,
          eventDate: item.date || '',
          eventTime: item.time || '',
          eventLocation: item.location || '',
          eventImage: item.image,
          eventSlug: item.eventId,
          eventEndDate: '',
          tickets: item.metadata?.tickets || [{
            ticketId: item.metadata?.ticketId || item.id,
            quantity: item.quantity,
            name: item.title.split(' - ')[1] || item.title,
            price: item.price,
            maxQuantity: 10
          }],
          total: item.price * item.quantity,
          addedAt: new Date().toISOString()
        }));
        saveCartToCookie(currentCity, oldFormatItems);
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [mounted, state.items]);

  // Слушаем изменения корзины из других вкладок через localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('cart_')) {
        try {
          const currentCity = getCurrentCity();
          const savedCart = localStorage.getItem(`cart_${currentCity}`);
          
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            if (parsedCart.items && parsedCart.items.length > 0) {
              // Очищаем текущую корзину
              dispatch({ type: 'CLEAR_CART' });
              
              // Загружаем данные из localStorage
              parsedCart.items.forEach((item: CartItem) => {
                dispatch({ type: 'ADD_ITEM', payload: item });
              });
            }
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  // Сброс анимации через 2 секунды
  useEffect(() => {
    if (state.isAnimating) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ANIMATING', payload: false });
        dispatch({ type: 'SET_LAST_ADDED', payload: undefined });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.isAnimating]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateTicketQuantity = (eventId: string, ticketId: string | number, quantity: number) => {
    const cartItem = state.items.find(item => item.eventId === eventId && item.type === 'ticket');
    if (cartItem && cartItem.metadata?.tickets) {
      const updatedTickets = cartItem.metadata.tickets.map((ticket: any) => 
        ticket.ticketId.toString() === ticketId.toString() 
          ? { ...ticket, quantity: Math.max(0, quantity) }
          : ticket
      ).filter((ticket: any) => ticket.quantity > 0);
      
      if (updatedTickets.length === 0) {
        // Если нет билетов, удаляем элемент
        removeFromCart(cartItem.id);
      } else {
        // Обновляем элемент
        const total = updatedTickets.reduce((sum: number, ticket: any) => sum + (ticket.price * ticket.quantity), 0);
        const updatedItem = {
          ...cartItem,
          price: total,
          metadata: {
            tickets: updatedTickets
          }
        };
        removeFromCart(cartItem.id);
        addToCart(updatedItem);
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Функция для очистки старых данных из cookies (временная)
  const clearOldCartData = () => {
    if (!mounted || typeof window === 'undefined') return;
    
    const currentCity = getCurrentCity();
    const cartKey = `cart_${currentCity}`;
    
    // Удаляем cookie
    document.cookie = `${cartKey}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    
    // Очищаем localStorage
    localStorage.removeItem(`cart_${currentCity}`);
    
    // Очищаем корзину
    dispatch({ type: 'CLEAR_CART' });
    
    console.log('Старые данные корзины очищены');
  };

  // Добавляем функцию в window для вызова из консоли
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      (window as any).clearOldCartData = clearOldCartData;
    }
  }, [mounted]);

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateTicketQuantity,
        clearCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования корзины
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
