'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Calendar, MapPin } from 'lucide-react';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface CartItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  price: number;
  quantity: number;
  date: string;
  venue: string;
  address: string;
}

interface SwipeableCartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onMoveToFavorites: (id: string) => void;
}

export default function SwipeableCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToFavorites
}: SwipeableCartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 300); // Animation delay
  };

  const handleMoveToFavorites = () => {
    onMoveToFavorites(item.id);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    onUpdateQuantity(item.id, newQuantity);
  };

  const actions = SwipeActionSets.cartItem(handleRemove, handleMoveToFavorites);

  return (
    <SwipeActions actions={actions}>
      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
        isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {/* Item Image */}
        <div className="relative h-32 bg-gray-200">
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Item Content */}
        <div className="p-4">
          {/* Title */}
          <Link href={`/event/${item.slug}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
              {item.title}
            </h3>
          </Link>

          {/* Date and Venue */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(item.date).toLocaleDateString('ru')}</span>
            </div>
            <div className="flex items-start text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{item.venue}</span>
            </div>
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors min-h-touch min-w-touch"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-lg font-semibold min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors min-h-touch min-w-touch"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.price * item.quantity} ₽
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-gray-500">
                  {item.price} ₽ × {item.quantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SwipeActions>
  );
}
