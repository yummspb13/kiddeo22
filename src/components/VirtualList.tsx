'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export default function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  onLoadMore,
  hasMore = false,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для infinite scroll
  const { isVisible: isSentinelVisible } = useIntersectionObserver({
    elementRef: sentinelRef,
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );
    
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Получаем видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  // Обработка скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Загрузка дополнительных элементов
  useEffect(() => {
    if (isSentinelVisible && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isSentinelVisible, hasMore, loading, onLoadMore]);

  // Вычисляем общую высоту списка
  const totalHeight = items.length * itemHeight;

  // Вычисляем смещение для видимых элементов
  const offsetY = visibleRange.startIndex * itemHeight;

  // Компонент загрузки
  const LoadingComponent = loadingComponent || (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
      <span className="ml-2 text-gray-600">Загрузка...</span>
    </div>
  );

  // Компонент пустого состояния
  const EmptyComponent = emptyComponent || (
    <div className="flex items-center justify-center py-12">
      <div className="text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Нет элементов для отображения</p>
      </div>
    </div>
  );

  if (items.length === 0) {
    return <div className={className}>{EmptyComponent}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentinel для infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1">
          {loading && LoadingComponent}
        </div>
      )}
    </div>
  );
}

// Специализированные компоненты для разных типов списков
export function VirtualEventsList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  ...props
}: Omit<VirtualListProps<T>, 'itemHeight' | 'containerHeight'> & {
  itemHeight?: number;
  containerHeight?: number;
}) {
  return (
    <VirtualList
      {...props}
      items={items}
      itemHeight={props.itemHeight || 200}
      containerHeight={props.containerHeight || 600}
      renderItem={renderItem}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      loadingComponent={
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Загрузка событий...</span>
        </div>
      }
      emptyComponent={
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">События не найдены</h3>
            <p>Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        </div>
      }
    />
  );
}

export function VirtualAdminTable<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  ...props
}: Omit<VirtualListProps<T>, 'itemHeight' | 'containerHeight'> & {
  itemHeight?: number;
  containerHeight?: number;
}) {
  return (
    <VirtualList
      {...props}
      items={items}
      itemHeight={props.itemHeight || 60}
      containerHeight={props.containerHeight || 400}
      renderItem={renderItem}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      loadingComponent={
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Загрузка данных...</span>
        </div>
      }
      emptyComponent={
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Нет данных для отображения</p>
          </div>
        </div>
      }
    />
  );
}

export function VirtualCommentsList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  ...props
}: Omit<VirtualListProps<T>, 'itemHeight' | 'containerHeight'> & {
  itemHeight?: number;
  containerHeight?: number;
}) {
  return (
    <VirtualList
      {...props}
      items={items}
      itemHeight={props.itemHeight || 120}
      containerHeight={props.containerHeight || 500}
      renderItem={renderItem}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      loadingComponent={
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="ml-2 text-sm text-gray-600">Загрузка комментариев...</span>
        </div>
      }
      emptyComponent={
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Пока нет комментариев</p>
          </div>
        </div>
      }
    />
  );
}
