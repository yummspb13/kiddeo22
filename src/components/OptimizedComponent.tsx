'use client';

import { memo, useMemo, useCallback, ReactNode, ComponentType } from 'react';

// HOC для мемоизации компонентов
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual);
}

// HOC для мемоизации с кастомной логикой сравнения
export function withShallowMemo<P extends object>(
  Component: ComponentType<P>,
  keys?: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    if (!keys) return false;
    
    return keys.every(key => {
      const prev = prevProps[key];
      const next = nextProps[key];
      
      if (prev === next) return true;
      if (prev == null || next == null) return false;
      if (typeof prev !== typeof next) return false;
      
      // Для объектов и массивов делаем поверхностное сравнение
      if (typeof prev === 'object') {
        if (Array.isArray(prev) && Array.isArray(next)) {
          return prev.length === next.length && 
                 prev.every((item, index) => item === next[index]);
        }
        return Object.keys(prev).length === Object.keys(next).length &&
               Object.keys(prev).every(key => prev[key] === next[key]);
      }
      
      return false;
    });
  });
}

// Компонент-обертка для оптимизации
interface OptimizedComponentProps {
  children: ReactNode;
  dependencies?: any[];
  memoize?: boolean;
  className?: string;
}

export default function OptimizedComponent({
  children,
  dependencies = [],
  memoize = true,
  className = ''
}: OptimizedComponentProps) {
  const memoizedChildren = useMemo(() => children, dependencies);
  
  return (
    <div className={className}>
      {memoize ? memoizedChildren : children}
    </div>
  );
}

// Утилиты для создания оптимизированных компонентов
export const createOptimizedComponent = <P extends object>(
  Component: ComponentType<P>,
  options: {
    memoize?: boolean;
    shallowCompare?: (keyof P)[];
    customCompare?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) => {
  const { memoize = true, shallowCompare, customCompare } = options;
  
  if (!memoize) return Component;
  
  if (customCompare) {
    return withMemo(Component, customCompare);
  }
  
  if (shallowCompare) {
    return withShallowMemo(Component, shallowCompare);
  }
  
  return withMemo(Component);
};

// Хук для мемоизации дорогих вычислений
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
    equalityFn?: (a: T, b: T) => boolean;
  } = {}
) {
  const { maxAge = 0, equalityFn } = options;
  
  return useMemo(() => {
    const result = factory();
    
    // Если указан maxAge, можно добавить логику кеширования
    if (maxAge > 0) {
      // Здесь можно добавить логику кеширования с TTL
    }
    
    return result;
  }, deps);
}

// Хук для мемоизации колбэков
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
  } = {}
): T {
  return useCallback(callback, deps);
}

// Компонент для ленивой загрузки с мемоизацией
interface LazyOptimizedComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  memoize?: boolean;
  className?: string;
}

export function LazyOptimizedComponent({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  memoize = true,
  className = ''
}: LazyOptimizedComponentProps) {
  const memoizedChildren = useMemo(() => children, [children]);
  
  return (
    <div className={className}>
      {memoize ? memoizedChildren : children}
    </div>
  );
}

// Утилиты для профилирования производительности
export function withPerformanceProfiling<P extends object>(
  Component: ComponentType<P>,
  componentName?: string
) {
  return memo((props: P) => {
    const startTime = performance.now();
    
    const result = <Component {...props} />;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(
        `${componentName || Component.name} render took ${renderTime.toFixed(2)}ms`,
        'Consider optimizing this component'
      );
    }
    
    return result;
  });
}

// Хук для отслеживания ре-рендеров
export function useRenderTracker(componentName: string) {
  const renderCount = useMemo(() => ({ count: 0 }), []);
  renderCount.count++;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} rendered ${renderCount.count} times`);
  }
  
  return renderCount.count;
}
