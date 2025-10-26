'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, User, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface OrderItem {
  id: string;
  title: string;
  slug: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  date: string;
  venue: string;
  address: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface SwipeableOrderItemProps {
  order: OrderItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  isVendor?: boolean;
}

export default function SwipeableOrderItem({
  order,
  onApprove,
  onReject,
  onEdit,
  isVendor = false
}: SwipeableOrderItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApprove(order.id);
      setIsProcessing(false);
    }, 500);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onReject(order.id);
      setIsProcessing(false);
    }, 500);
  };

  const handleEdit = () => {
    onEdit(order.id);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock, label: 'Ожидает' };
      case 'approved':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Одобрен' };
      case 'rejected':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle, label: 'Отклонен' };
      case 'completed':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle, label: 'Завершен' };
      case 'cancelled':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: XCircle, label: 'Отменен' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock, label: 'Неизвестно' };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  // Only show swipe actions for pending orders and if user is vendor
  const shouldShowActions = isVendor && order.status === 'pending';
  const actions = shouldShowActions 
    ? SwipeActionSets.order(handleApprove, handleReject, handleEdit)
    : [];

  return (
    <SwipeActions actions={actions}>
      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
        isProcessing ? 'opacity-50' : 'opacity-100'
      }`}>
        {/* Header with Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/order/${order.id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
                {order.title}
              </h3>
            </Link>
            
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Date and Venue */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(order.date).toLocaleDateString('ru', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-start text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{order.venue}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-4">
          {/* Customer Info */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <User className="w-4 h-4 mr-2" />
            <span>{order.customerName}</span>
            <span className="mx-2">•</span>
            <span>{order.customerPhone}</span>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="text-gray-900 font-medium">{item.price * item.quantity} ₽</span>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Итого:</span>
            <span className="text-lg font-bold text-red-600">{order.totalAmount} ₽</span>
          </div>

          {/* Action Buttons for Non-Vendor Users */}
          {!isVendor && order.status === 'pending' && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => onEdit(order.id)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-touch"
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Редактировать
              </button>
            </div>
          )}

          {/* Status-specific actions for vendors */}
          {isVendor && order.status === 'pending' && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 min-h-touch"
              >
                <CheckCircle className="w-4 h-4 mr-2 inline" />
                Одобрить
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 min-h-touch"
              >
                <XCircle className="w-4 h-4 mr-2 inline" />
                Отклонить
              </button>
            </div>
          )}
        </div>
      </div>
    </SwipeActions>
  );
}
