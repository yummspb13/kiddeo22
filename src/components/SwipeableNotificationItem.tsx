'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, MapPin, User, CheckCircle, Archive, Trash2, Eye } from 'lucide-react';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'event' | 'venue' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    orderId?: string;
    eventId?: string;
    venueId?: string;
    customerName?: string;
    amount?: number;
  };
}

interface SwipeableNotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export default function SwipeableNotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onArchive
}: SwipeableNotificationItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    setIsProcessing(true);
    setTimeout(() => {
      onMarkAsRead(notification.id);
      setIsProcessing(false);
    }, 300);
  };

  const handleDelete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onDelete(notification.id);
    }, 300);
  };

  const handleArchive = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onArchive(notification.id);
    }, 300);
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'order':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Calendar };
      case 'event':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar };
      case 'venue':
        return { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: MapPin };
      case 'system':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Bell };
      case 'promotion':
        return { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Bell };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Bell };
    }
  };

  const typeInfo = getTypeInfo(notification.type);
  const TypeIcon = typeInfo.icon;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${diffInHours}ч назад`;
    } else if (diffInHours < 48) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const actions = SwipeActionSets.notification(handleMarkAsRead, handleDelete, handleArchive);

  const NotificationContent = () => (
    <div className={`bg-white border-l-4 ${
      notification.isRead ? 'border-gray-200' : 'border-red-500'
    } rounded-lg shadow-sm transition-all duration-300 ${
      isProcessing ? 'opacity-50' : 'opacity-100'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
              <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${
                notification.isRead ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(notification.createdAt)}
              </p>
            </div>
          </div>
          
          {!notification.isRead && (
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
          )}
        </div>

        {/* Message */}
        <p className={`text-sm mb-3 ${
          notification.isRead ? 'text-gray-600' : 'text-gray-800'
        }`}>
          {notification.message}
        </p>

        {/* Metadata */}
        {notification.metadata && (
          <div className="space-y-2 mb-3">
            {notification.metadata.customerName && (
              <div className="flex items-center text-xs text-gray-500">
                <User className="w-3 h-3 mr-2" />
                <span>{notification.metadata.customerName}</span>
              </div>
            )}
            {notification.metadata.amount && (
              <div className="text-xs text-gray-500">
                Сумма: {notification.metadata.amount} ₽
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {notification.actionUrl && (
          <Link
            href={notification.actionUrl}
            className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
            onClick={handleMarkAsRead}
          >
            <Eye className="w-4 h-4 mr-1" />
            Подробнее
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <SwipeActions actions={actions}>
      <NotificationContent />
    </SwipeActions>
  );
}
