'use client';
import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuthBridge() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        const data = await response.json();
        
        // Если токен был обновлен, обновляем кэш
        if (data.refreshed) {
          console.log('🔄 Auth token refreshed');
        }
        
        return data;
      } catch (error) {
        console.error('Auth error:', error);
        return { user: null } as { user: User | null };
      }
    },
    initialData: { user: null } as { user: User | null },
    staleTime: 2 * 60 * 1000, // 2 минуты (меньше для более частых проверок)
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: 1, // Разрешаем одну попытку повтора
    refetchOnWindowFocus: true, // Обновляем при фокусе на окне
    refetchOnMount: true, // Обновляем при монтировании
    refetchOnReconnect: true, // Обновляем при восстановлении соединения
    refetchInterval: 5 * 60 * 1000, // Автоматически обновляем каждые 5 минут
  });

  return { 
    user: data?.user ?? null, 
    loading: isLoading, 
    refetch 
  };
}
