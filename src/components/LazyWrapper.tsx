'use client';

import { Suspense, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export default function LazyWrapper({
  children,
  fallback = (
    <div className="animate-pulse bg-gray-200 h-32 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Загрузка...</span>
    </div>
  ),
  threshold = 0.1,
  rootMargin = '100px',
  className = ''
}: LazyWrapperProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

// Специализированные lazy wrappers для разных типов контента
export const LazyImage = ({ children, ...props }: Omit<LazyWrapperProps, 'fallback'>) => (
  <LazyWrapper
    {...props}
    fallback={
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка изображения...</span>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);

export const LazyChart = ({ children, ...props }: Omit<LazyWrapperProps, 'fallback'>) => (
  <LazyWrapper
    {...props}
    fallback={
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка графика...</span>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);

export const LazyTable = ({ children, ...props }: Omit<LazyWrapperProps, 'fallback'>) => (
  <LazyWrapper
    {...props}
    fallback={
      <div className="animate-pulse bg-gray-200 h-96 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка таблицы...</span>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);

export const LazyMap = ({ children, ...props }: Omit<LazyWrapperProps, 'fallback'>) => (
  <LazyWrapper
    {...props}
    fallback={
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка карты...</span>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);

export const LazyEditor = ({ children, ...props }: Omit<LazyWrapperProps, 'fallback'>) => (
  <LazyWrapper
    {...props}
    fallback={
      <div className="animate-pulse bg-gray-200 h-96 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка редактора...</span>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);
