'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { useSessionManager } from '@/utils/sessionManager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export function useAuthBridge() {
  const sessionManager = useSessionManager();
  
  // Используем try-catch для безопасного получения QueryClient
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    // QueryClient не доступен, возвращаем fallback
    return {
      user: null,
      loading: true,
      refetch: async () => {}
    };
  }
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (!response.ok) {
          return { user: null } as { user: User | null };
        }
        
        const data = await response.json();
        
        // Если получили пользователя, инициализируем сессию
        if (data.user && data.user.id) {
          const currentUserId = sessionManager.getCurrentUserId();
          
          // Проверяем, не сменился ли пользователь
          if (currentUserId && currentUserId !== data.user.id) {
            console.log('🔄 useAuthBridge: User changed, clearing data');
            await sessionManager.clearAllData();
            return { user: null };
          }
          
          // Инициализируем сессию для нового пользователя
          if (!currentUserId) {
            await sessionManager.initializeSession(data.user.id);
          }
        } else {
          // Пользователь не авторизован, очищаем сессию
          const currentUserId = sessionManager.getCurrentUserId();
          if (currentUserId) {
            console.log('🔄 useAuthBridge: User logged out, clearing session');
            await sessionManager.clearAllData();
          }
        }
        
        return data;
      } catch (error) {
        console.error('🔍 useAuthBridge: Network error:', error);
        return { user: null } as { user: User | null };
      }
    },
    // Оптимизированные настройки для предотвращения бесконечных циклов
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 15 * 60 * 1000, // 15 минут - время жизни в кэше
    retry: 1, // Одна попытка повтора при ошибке
    refetchOnWindowFocus: false, // Отключаем обновление при фокусе
    refetchOnMount: false, // НЕ обновляем при монтировании (используем кэш)
    refetchOnReconnect: false, // НЕ обновляем при восстановлении соединения
    refetchInterval: false, // Отключаем автоматическое обновление
    refetchIntervalInBackground: false, // Отключаем обновление в фоне
  });

  // Мемоизируем результат для предотвращения лишних ре-рендеров
  return useMemo(() => ({
    user: data?.user ?? null,
    loading: isLoading,
    refetch
  }), [data?.user, isLoading, refetch]);
}
