import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Утилиты для мемоизации компонентов
export function createMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): React.MemoExoticComponent<T> {
  return memo(Component, areEqual);
}

// Утилиты для мемоизации с shallow comparison
export function createShallowMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  keys?: (keyof React.ComponentProps<T>)[]
): React.MemoExoticComponent<T> {
  return memo(Component, (prevProps, nextProps) => {
    if (!keys) return false;
    
    return keys.every(key => {
      const prev = prevProps[key];
      const next = nextProps[key];
      
      if (prev === next) return true;
      if (prev == null || next == null) return false;
      if (typeof prev !== typeof next) return false;
      
      // Shallow comparison для объектов
      if (typeof prev === 'object' && !Array.isArray(prev)) {
        return Object.keys(prev).length === Object.keys(next).length &&
               Object.keys(prev).every(k => prev[k] === next[k]);
      }
      
      // Shallow comparison для массивов
      if (Array.isArray(prev) && Array.isArray(next)) {
        return prev.length === next.length && 
               prev.every((item, index) => item === next[index]);
      }
      
      return false;
    });
  });
}

// Хук для мемоизации дорогих вычислений с кешированием
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
    maxSize?: number;
  } = {}
) {
  const { maxAge = 0, maxSize = 100 } = options;
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  const keyRef = useRef<string>('');
  
  // Создаем ключ на основе зависимостей
  const key = useMemo(() => {
    return deps.map(dep => 
      typeof dep === 'object' ? JSON.stringify(dep) : String(dep)
    ).join('|');
  }, deps);
  
  return useMemo(() => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);
    
    // Проверяем кеш
    if (cached && (maxAge === 0 || now - cached.timestamp < maxAge)) {
      return cached.value;
    }
    
    // Очищаем старые записи если превышен размер кеша
    if (cacheRef.current.size >= maxSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(oldestKey);
    }
    
    // Вычисляем новое значение
    const value = factory();
    cacheRef.current.set(key, { value, timestamp: now });
    
    return value;
  }, [key, maxAge, maxSize]);
}

// Хук для мемоизации колбэков с debounce
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);
  
  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]) as T;
}

// Хук для мемоизации колбэков с throttle
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callbackRef.current(...args);
    }
  }, [delay, ...deps]) as T;
}

// Хук для отслеживания ре-рендеров
export function useRenderTracker(componentName: string) {
  const renderCountRef = useRef(0);
  const prevPropsRef = useRef<any>(undefined);
  
  renderCountRef.current++;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} rendered ${renderCountRef.current} times`);
  }
  
  return {
    renderCount: renderCountRef.current,
    trackProps: (props: any) => {
      if (prevPropsRef.current) {
        const changedProps = Object.keys(props).filter(
          key => prevPropsRef.current[key] !== props[key]
        );
        
        if (changedProps.length > 0 && process.env.NODE_ENV === 'development') {
          console.log(`${componentName} props changed:`, changedProps);
        }
      }
      
      prevPropsRef.current = props;
    }
  };
}

// Хук для профилирования производительности
export function usePerformanceProfiler(componentName: string) {
  const startTimeRef = useRef<number | undefined>(undefined);
  const renderCountRef = useRef(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
  });
  
  useEffect(() => {
    if (startTimeRef.current) {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      renderCountRef.current++;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render #${renderCountRef.current}: ${renderTime.toFixed(2)}ms`);
        
        if (renderTime > 16) {
          console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms - consider optimizing`);
        }
      }
    }
  });
}

// Утилита для создания оптимизированного компонента
export function createOptimizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  options: {
    memoize?: boolean;
    shallowCompare?: (keyof React.ComponentProps<T>)[];
    customCompare?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean;
    trackRenders?: boolean;
    profilePerformance?: boolean;
  } = {}
): T {
  const {
    memoize = true,
    shallowCompare,
    customCompare,
    trackRenders = false,
    profilePerformance = false
  } = options;
  
  let OptimizedComponent: React.ComponentType<any> = Component;
  
  // Применяем мемоизацию
  if (memoize) {
    if (customCompare) {
      OptimizedComponent = memo(Component, customCompare);
    } else if (shallowCompare) {
      OptimizedComponent = createShallowMemoizedComponent(Component, shallowCompare);
    } else {
      OptimizedComponent = memo(Component);
    }
  }
  
  // Добавляем отслеживание ре-рендеров
  if (trackRenders) {
    const OriginalComponent = OptimizedComponent;
    OptimizedComponent = ((props: any) => {
      useRenderTracker(Component.displayName || Component.name || 'Component');
      return React.createElement(OriginalComponent, props);
    }) as T;
  }
  
  // Добавляем профилирование производительности
  if (profilePerformance) {
    const OriginalComponent = OptimizedComponent;
    OptimizedComponent = ((props: any) => {
      usePerformanceProfiler(Component.displayName || Component.name || 'Component');
      return React.createElement(OriginalComponent, props);
    }) as T;
  }
  
  return OptimizedComponent as T;
}

// Хук для создания стабильных ссылок на объекты
export function useStableObject<T extends object>(obj: T): T {
  return useMemo(() => obj, Object.values(obj));
}

// Хук для создания стабильных ссылок на функции
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Хук для создания стабильных ссылок на массивы
export function useStableArray<T>(arr: T[]): T[] {
  return useMemo(() => arr, arr);
}

// Утилита для создания мемоизированного селектора
export function createMemoizedSelector<TState, TResult>(
  selector: (state: TState) => TResult,
  equalityFn?: (a: TResult, b: TResult) => boolean
) {
  let lastResult: TResult;
  let lastState: TState;
  
  return (state: TState): TResult => {
    if (state === lastState) {
      return lastResult;
    }
    
    const result = selector(state);
    
    if (equalityFn ? equalityFn(result, lastResult) : result === lastResult) {
      return lastResult;
    }
    
    lastState = state;
    lastResult = result;
    
    return result;
  };
}

// Хук для создания мемоизированного селектора
export function useMemoizedSelector<TState, TResult>(
  state: TState,
  selector: (state: TState) => TResult,
  equalityFn?: (a: TResult, b: TResult) => boolean
): TResult {
  return useMemo(() => selector(state), [state, selector, equalityFn]);
}

// Утилита для создания оптимизированного контекста
export function createOptimizedContext<T extends object>(defaultValue: T) {
  const Context = React.createContext(defaultValue);
  
  const Provider = memo<{ value: T; children: React.ReactNode }>(({ value, children }) => {
    const stableValue = useStableObject(value);
    return React.createElement(Context.Provider, { value: stableValue }, children);
  });
  
  const useContext = () => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error('useContext must be used within a Provider');
    }
    return context;
  };
  
  return { Context, Provider, useContext };
}

// Хук для создания оптимизированного состояния
export function useOptimizedState<T extends object>(
  initialState: T | (() => T),
  options: {
    equalityFn?: (a: T, b: T) => boolean;
    memoize?: boolean;
  } = {}
) {
  const { equalityFn, memoize = true } = options;
  
  const [state, setState] = useState(initialState);
  
  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    if (typeof newState === 'function') {
      setState(prev => {
        const result = (newState as (prev: T) => T)(prev);
        return equalityFn && equalityFn(prev, result) ? prev : result;
      });
    } else {
      if (equalityFn && equalityFn(state, newState)) {
        return;
      }
      setState(newState);
    }
  }, [state, equalityFn]);
  
  const memoizedState = memoize ? useStableObject(state) : state;
  
  return [memoizedState, setOptimizedState] as const;
}
