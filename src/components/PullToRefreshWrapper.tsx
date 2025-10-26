'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

export default function PullToRefreshWrapper({
  children,
  onRefresh,
  threshold = 100,
  backgroundColor = '#f3f4f6',
  textColor = '#6b7280',
  className = ''
}: PullToRefreshWrapperProps) {
  const { elementRef, isRefreshing, isPulling, pullDistance, refresherProps } = usePullToRefresh({
    threshold,
    onRefresh,
    backgroundColor,
    textColor
  });

  return (
    <div ref={elementRef} className={`min-h-screen ${className}`}>
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div {...refresherProps}>
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-5 h-5 animate-spin ${isRefreshing ? 'text-red-600' : 'text-gray-500'}`} />
              <span className={`text-sm ${isRefreshing ? 'text-red-600' : 'text-gray-500'}`}>
                {isRefreshing ? 'Обновление...' : 'Потяните для обновления'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
