'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Heart, Share2, Edit, Archive, Check, X } from 'lucide-react';
import { useHorizontalSwipe } from '@/hooks/useSwipe';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export default function SwipeActions({
  children,
  actions,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className = ''
}: SwipeActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const maxSwipeDistance = actions.length * 80; // 80px per action

  const { elementRef } = useHorizontalSwipe(
    () => {
      // Swipe left - show actions
      if (!isOpen) {
        setIsOpen(true);
        setSwipeDistance(maxSwipeDistance);
      }
    },
    () => {
      // Swipe right - hide actions
      if (isOpen) {
        setIsOpen(false);
        setSwipeDistance(0);
      }
    },
    { threshold, preventDefault: true }
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = startX.current - currentX.current;
    
    if (deltaX > 0) {
      // Swiping left - show actions
      const distance = Math.min(deltaX, maxSwipeDistance);
      setSwipeDistance(distance);
    } else {
      // Swiping right - hide actions
      const distance = Math.max(maxSwipeDistance + deltaX, 0);
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (swipeDistance > maxSwipeDistance / 2) {
      // Show actions
      setIsOpen(true);
      setSwipeDistance(maxSwipeDistance);
    } else {
      // Hide actions
      setIsOpen(false);
      setSwipeDistance(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.action();
    setIsOpen(false);
    setSwipeDistance(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSwipeDistance(0);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Actions Background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${isOpen ? 0 : maxSwipeDistance}px)`,
          width: `${maxSwipeDistance}px`
        }}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`flex-1 h-full flex items-center justify-center ${action.bgColor} hover:opacity-90 transition-opacity min-h-touch`}
            style={{ width: '80px' }}
            aria-label={action.label}
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div
        ref={elementRef}
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(-${swipeDistance}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Close Button - only show when actions are open */}
      {isOpen && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-1 bg-black/20 rounded-full text-white hover:bg-black/30 transition-colors"
          aria-label="Закрыть действия"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Predefined action sets for common use cases
export const SwipeActionSets = {
  // Cart item actions
  cartItem: (onRemove: () => void, onMoveToFavorites: () => void): SwipeAction[] => [
    {
      id: 'remove',
      label: 'Удалить',
      icon: Trash2,
      color: 'text-white',
      bgColor: 'bg-red-500',
      action: onRemove
    },
    {
      id: 'favorite',
      label: 'В избранное',
      icon: Heart,
      color: 'text-white',
      bgColor: 'bg-pink-500',
      action: onMoveToFavorites
    }
  ],

  // Order actions
  order: (onApprove: () => void, onReject: () => void, onEdit: () => void): SwipeAction[] => [
    {
      id: 'approve',
      label: 'Одобрить',
      icon: Check,
      color: 'text-white',
      bgColor: 'bg-green-500',
      action: onApprove
    },
    {
      id: 'reject',
      label: 'Отклонить',
      icon: X,
      color: 'text-white',
      bgColor: 'bg-red-500',
      action: onReject
    },
    {
      id: 'edit',
      label: 'Редактировать',
      icon: Edit,
      color: 'text-white',
      bgColor: 'bg-blue-500',
      action: onEdit
    }
  ],

  // Favorite actions
  favorite: (onRemove: () => void, onShare: () => void): SwipeAction[] => [
    {
      id: 'remove',
      label: 'Удалить',
      icon: Trash2,
      color: 'text-white',
      bgColor: 'bg-red-500',
      action: onRemove
    },
    {
      id: 'share',
      label: 'Поделиться',
      icon: Share2,
      color: 'text-white',
      bgColor: 'bg-blue-500',
      action: onShare
    }
  ],

  // Notification actions
  notification: (onMarkAsRead: () => void, onDelete: () => void, onArchive: () => void): SwipeAction[] => [
    {
      id: 'mark-read',
      label: 'Прочитано',
      icon: Check,
      color: 'text-white',
      bgColor: 'bg-green-500',
      action: onMarkAsRead
    },
    {
      id: 'archive',
      label: 'Архив',
      icon: Archive,
      color: 'text-white',
      bgColor: 'bg-gray-500',
      action: onArchive
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: Trash2,
      color: 'text-white',
      bgColor: 'bg-red-500',
      action: onDelete
    }
  ],

  // Event/Venue actions
  eventVenue: (onFavorite: () => void, onShare: () => void, onEdit?: () => void): SwipeAction[] => {
    const actions: SwipeAction[] = [
      {
        id: 'favorite',
        label: 'В избранное',
        icon: Heart,
        color: 'text-white',
        bgColor: 'bg-pink-500',
        action: onFavorite
      },
      {
        id: 'share',
        label: 'Поделиться',
        icon: Share2,
        color: 'text-white',
        bgColor: 'bg-blue-500',
        action: onShare
      }
    ];

    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Редактировать',
        icon: Edit,
        color: 'text-white',
        bgColor: 'bg-gray-500',
        action: onEdit
      });
    }

    return actions;
  }
};
