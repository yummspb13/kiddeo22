'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
}

export default function ResponsiveCard({
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  onClick
}: ResponsiveCardProps) {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-gray-200 hover:border-gray-300',
    filled: 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    xl: 'p-8 md:p-12'
  };
  
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' 
    : '';
  
  const responsiveClasses = `
    w-full
    sm:w-full
    md:w-full
    lg:w-full
    xl:w-full
  `;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        responsiveClasses,
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

// Специализированные карточки
export const EventCard = ({ children, className, ...props }: Omit<ResponsiveCardProps, 'size'>) => (
  <ResponsiveCard
    {...props}
    size="md"
    variant="elevated"
    className={cn('hover:shadow-lg', className)}
  >
    {children}
  </ResponsiveCard>
);

export const VenueCard = ({ children, className, ...props }: Omit<ResponsiveCardProps, 'size'>) => (
  <ResponsiveCard
    {...props}
    size="lg"
    variant="default"
    className={cn('hover:shadow-md', className)}
  >
    {children}
  </ResponsiveCard>
);

export const ProductCard = ({ children, className, ...props }: Omit<ResponsiveCardProps, 'size'>) => (
  <ResponsiveCard
    {...props}
    size="sm"
    variant="outlined"
    interactive
    className={cn('hover:border-red-300 hover:shadow-md', className)}
  >
    {children}
  </ResponsiveCard>
);

export const InfoCard = ({ children, className, ...props }: Omit<ResponsiveCardProps, 'size'>) => (
  <ResponsiveCard
    {...props}
    size="md"
    variant="filled"
    className={cn('border-l-4 border-l-red-500', className)}
  >
    {children}
  </ResponsiveCard>
);
