'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { saveCartToCookie, loadCartFromCookie, getCurrentCity } from '@/utils/cookies';
import { useUser } from '@/hooks/useUser';
import { useSessionManager } from '@/utils/sessionManager';

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
  | { type: 'UPDATE_ITEM_METADATA'; payload: { id: string; metadata: Record<string, any> } }
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

    case 'UPDATE_ITEM_METADATA': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, metadata: { ...item.metadata, ...action.payload.metadata } }
          : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
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
  forceLoadCart: () => Promise<void>;
} | null>(null);

// Провайдер корзины
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const lastSavedCartRef = useRef<string>('');
  const sessionManager = useSessionManager();
  const lastUserIdRef = useRef<string | null>(null);

  // Устанавливаем mounted после монтирования компонента
  useEffect(() => {
    setMounted(true);
  }, []);

  // Отслеживаем смену пользователя и очищаем корзину
  useEffect(() => {
    if (!mounted) return;
    
    const currentUserId = user?.id?.toString() || null;
    const lastUserId = lastUserIdRef.current;
    
    // Если пользователь изменился, очищаем корзину
    if (lastUserId && currentUserId && lastUserId !== currentUserId) {
      console.log('🔄 CartContext: User changed, clearing cart');
      dispatch({ type: 'CLEAR_CART' });
    }
    
    // Обновляем последний ID пользователя
    lastUserIdRef.current = currentUserId;
  }, [user?.id, mounted]);

  // Загружаем корзину при инициализации
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Проверяем, не загружена ли уже корзина
    if (state.items.length > 0) {
      return;
    }
    
    // Добавляем небольшую задержку для стабильности
    const timeoutId = setTimeout(() => {
      const loadCart = async () => {
      try {
        const currentCity = getCurrentCity();
        
        
        if (user?.id) {
          // Пользователь авторизован - загружаем из API
          try {
            const response = await fetch(`/api/cart?city=${currentCity}&_t=${Date.now()}`, {
              headers: {
                'x-user-id': user.id.toString(),
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.items && data.items.length > 0) {
                data.items.forEach((item: CartItem) => {
                  dispatch({ type: 'ADD_ITEM', payload: item });
                });
              } else {
                // Если в API нет корзины, проверяем localStorage для восстановления
                const savedCart = localStorage.getItem(`cart_${currentCity}_${user.id}`);
                if (savedCart) {
                  const parsedCart = JSON.parse(savedCart);
                  if (parsedCart.items && parsedCart.items.length > 0) {
                    parsedCart.items.forEach((item: CartItem) => {
                      dispatch({ type: 'ADD_ITEM', payload: item });
                    });
                  }
                }
              }
              return;
            }
          } catch (apiError) {
            console.error('CartContext: Error loading cart from API:', apiError);
            // Fallback to localStorage
          }
        }
        
        // Пользователь не авторизован или API недоступен - загружаем из localStorage
        const savedCart = localStorage.getItem(`cart_${currentCity}`);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (parsedCart.items && parsedCart.items.length > 0) {
            parsedCart.items.forEach((item: CartItem) => {
              dispatch({ type: 'ADD_ITEM', payload: item });
            });
            return;
          }
        }
        
        // Если в localStorage нет, загружаем из cookies
        const cookieCart = loadCartFromCookie(currentCity);
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
        console.error('Error loading cart:', error);
      } finally {
        // Загрузка завершена
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      };
      
      loadCart();
    }, 100); // 100ms задержка для стабильности
    
    return () => clearTimeout(timeoutId);
  }, [mounted, user?.id]);

  // Сохраняем корзину при изменении с дебаунсингом
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Проверяем, действительно ли изменилась корзина
    const currentCartString = JSON.stringify({
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    });
    
    if (currentCartString === lastSavedCartRef.current) {
      return; // Корзина не изменилась, не сохраняем
    }
    
    // Дебаунсинг - сохраняем корзину только через 2000ms после последнего изменения
    const timeoutId = setTimeout(async () => {
      try {
        const currentCity = getCurrentCity();
        
        if (user?.id) {
          // Пользователь авторизован - сохраняем в API
          try {
            const response = await fetch(`/api/cart?city=${currentCity}`, {
              method: 'POST',
              headers: {
                'x-user-id': user.id.toString(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                items: state.items,
                total: state.total,
                itemCount: state.itemCount
              })
            });
            
            if (response.ok) {
              lastSavedCartRef.current = currentCartString;
              return;
            }
          } catch (apiError) {
            console.error('CartContext: Error saving cart to API:', apiError);
            // Fallback to localStorage
          }
        }
        
        // Пользователь не авторизован или API недоступен - сохраняем в localStorage
        const cartData = {
          items: state.items,
          total: state.total,
          itemCount: state.itemCount,
          lastUpdated: new Date().toISOString()
        };
        
        
        // Сохраняем в localStorage с привязкой к пользователю
        if (user?.id) {
          localStorage.setItem(`cart_${currentCity}_${user.id}`, JSON.stringify(cartData));
        } else {
          localStorage.setItem(`cart_${currentCity}`, JSON.stringify(cartData));
        }
        
        lastSavedCartRef.current = currentCartString;
        
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
        console.error('Error saving cart:', error);
      }
    }, 2000);
    
    // Очищаем таймер при размонтировании
    return () => clearTimeout(timeoutId);
  }, [mounted, state.items, user?.id]);

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

  // Очищаем корзину при смене пользователя
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Если пользователь изменился, очищаем корзину
    const currentUserId = user?.id;
    const lastUserId = localStorage.getItem('lastUserId');
    
    if (currentUserId !== lastUserId) {
      dispatch({ type: 'CLEAR_CART' });
      
      // Сохраняем текущего пользователя
      if (currentUserId) {
        localStorage.setItem('lastUserId', currentUserId.toString());
      } else {
        localStorage.removeItem('lastUserId');
      }
    }
  }, [mounted, user?.id]);

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

  const addToCart = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, [dispatch]);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const updateTicketQuantity = useCallback((eventId: string, ticketId: string | number, quantity: number) => {
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
  }, [state.items, addToCart, removeFromCart]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    
    // Очищаем localStorage при выходе из аккаунта
    if (typeof window !== 'undefined') {
      const currentCity = getCurrentCity();
      
      // Очищаем корзину для всех пользователей
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`cart_${currentCity}`)) {
          localStorage.removeItem(key);
        }
      });
      
    }
  }, []);

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

  // Добавляем функции в window для вызова из консоли
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      (window as any).clearOldCartData = clearOldCartData;
      (window as any).checkCartData = () => {
        const currentCity = getCurrentCity();
        const savedCart = localStorage.getItem(`cart_${currentCity}`);
        return { savedCart, state };
      };
    }
  }, [mounted, state]);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  // Функция для принудительной загрузки корзины
  const forceLoadCart = useCallback(async () => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }
    
    
    try {
      const currentCity = getCurrentCity();
      
      // Проверяем localStorage
      const savedCart = localStorage.getItem(`cart_${currentCity}`);
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        if (parsedCart.items && parsedCart.items.length > 0) {
          // Очищаем текущую корзину
          dispatch({ type: 'CLEAR_CART' });
          // Загружаем данные
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: 'ADD_ITEM', payload: item });
          });
          return;
        } else {
        }
      } else {
      }
      
      // Проверяем cookies
      const cookieCart = loadCartFromCookie(currentCity);
      if (cookieCart && cookieCart.length > 0) {
        // Очищаем текущую корзину
        dispatch({ type: 'CLEAR_CART' });
        // Конвертируем старый формат в новый
        cookieCart.forEach((oldItem: any) => {
          if (oldItem.tickets && oldItem.tickets.length > 0) {
            const cartItem: CartItem = {
              id: oldItem.eventSlug || oldItem.eventTitle,
              type: 'ticket',
              eventId: oldItem.eventSlug,
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
      }
    } catch (error) {
      console.error('Error force loading cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [mounted]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateTicketQuantity,
    clearCart,
    toggleCart,
    forceLoadCart,
  }), [state, addToCart, removeFromCart, updateQuantity, updateTicketQuantity, clearCart, toggleCart, forceLoadCart]);

  return (
    <CartContext.Provider value={contextValue}>
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
