'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Check, Sparkles, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>;
  variant?: 'default' | 'large' | 'small' | 'icon';
  className?: string;
  showQuantity?: boolean;
  maxQuantity?: number;
}

export function AddToCartButton({ 
  item, 
  variant = 'default', 
  className = '',
  showQuantity = false,
  maxQuantity
}: AddToCartButtonProps) {
  const { addToCart, state } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Проверяем, есть ли товар в корзине
  const cartItem = state.items.find(cartItem => cartItem.id === item.id);
  const currentQuantity = cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  const handleAddToCart = () => {
    if (maxQuantity && currentQuantity >= maxQuantity) {
      return;
    }

    setIsAdded(true);
    setIsAnimating(true);
    addToCart(item);

    // Сброс состояния через 2 секунды
    setTimeout(() => {
      setIsAdded(false);
      setIsAnimating(false);
    }, 2000);
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'large':
        return (
          <div className="flex items-center gap-3">
            <motion.div
              animate={isAnimating ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.6 }}
            >
              {isAdded ? (
                <Check className="w-6 h-6" />
              ) : (
                <ShoppingCart className="w-6 h-6" />
              )}
            </motion.div>
            <span className="text-lg font-semibold">
              {isAdded ? 'Добавлено!' : 'В корзину'}
            </span>
            {showQuantity && currentQuantity > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold"
              >
                {currentQuantity}
              </motion.span>
            )}
          </div>
        );

      case 'small':
        return (
          <div className="flex items-center gap-2">
            <motion.div
              animate={isAnimating ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.6 }}
            >
              {isAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </motion.div>
            <span className="text-sm font-medium">
              {isAdded ? 'Добавлено' : 'Добавить'}
            </span>
          </div>
        );

      case 'icon':
        return (
          <motion.div
            animate={isAnimating ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.6 }}
          >
            {isAdded ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </motion.div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <motion.div
              animate={isAnimating ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.6 }}
            >
              {isAdded ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </motion.div>
            <span className="font-semibold">
              {isAdded ? 'Добавлено!' : 'В корзину'}
            </span>
            {showQuantity && currentQuantity > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold"
              >
                {currentQuantity}
              </motion.span>
            )}
          </div>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 font-semibold rounded-xl flex items-center justify-center";
    
    switch (variant) {
      case 'large':
        return `${baseStyles} px-8 py-4 text-lg min-w-[200px]`;
      case 'small':
        return `${baseStyles} px-4 py-2 text-sm min-w-[120px]`;
      case 'icon':
        return `${baseStyles} w-12 h-12 rounded-full`;
      default:
        return `${baseStyles} px-6 py-3 min-w-[150px]`;
    }
  };

  const isDisabled = maxQuantity ? currentQuantity >= maxQuantity : false;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`
        ${getButtonStyles()}
        ${isAdded 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
          : isInCart
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Анимация фона */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isAnimating ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400"
      />

      {/* Эффект частиц */}
      <AnimatePresence>
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [1, 0, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 40,
                  y: Math.sin(i * 45 * Math.PI / 180) * 40,
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Эффект волны */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={isAnimating ? { scale: 2, opacity: 0 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 rounded-xl bg-white/30"
      />

      {/* Содержимое кнопки */}
      <motion.div
        animate={isAdded ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex items-center gap-2"
      >
        {getButtonContent()}
      </motion.div>

      {/* Эффект блеска */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={isAnimating ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      {/* Индикатор максимального количества */}
      {isDisabled && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          !
        </div>
      )}
    </motion.button>
  );
}

// Компонент для быстрого добавления с количеством
export function QuickAddToCart({ 
  item, 
  className = '' 
}: { 
  item: Omit<CartItem, 'quantity'>; 
  className?: string; 
}) {
  const { addToCart, updateQuantity, state } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const cartItem = state.items.find(cartItem => cartItem.id === item.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (currentQuantity === 0) {
      addToCart({ ...item, quantity } as CartItem);
    } else {
      updateQuantity(item.id, currentQuantity + quantity);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center border border-gray-300 rounded-lg">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        
        <motion.span
          key={quantity}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="px-3 py-2 font-semibold min-w-[3rem] text-center"
        >
          {quantity}
        </motion.span>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity(quantity + 1)}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      <AddToCartButton 
        item={{ ...item, quantity } as CartItem} 
        variant="default"
        showQuantity
      />
    </div>
  );
}
