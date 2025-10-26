'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  position = 'center',
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}: ResponsiveModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16'
  };
  
  const modalContent = (
    <div className="fixed inset-0 z-50 flex p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full',
          sizeClasses[size],
          positionClasses[position],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Закрыть модальное окно"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
  
  // Render modal in portal
  return createPortal(modalContent, document.body);
}

// Mobile Bottom Sheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  closeOnOverlayClick = true,
  showCloseButton = true
}: BottomSheetProps) {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const bottomSheetContent = (
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Bottom Sheet */}
      <div
        className={cn(
          'relative bg-white rounded-t-xl shadow-xl w-full max-h-[90vh] overflow-y-auto',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
            {title && (
              <h2 id="bottom-sheet-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
  
  return createPortal(bottomSheetContent, document.body);
}

// Drawer (Sidebar)
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
  size = 'md',
  className,
  closeOnOverlayClick = true,
  showCloseButton = true
}: DrawerProps) {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[28rem]'
  };
  
  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };
  
  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          'relative bg-white shadow-xl w-full max-h-screen overflow-y-auto',
          sizeClasses[size],
          positionClasses[position],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
            {title && (
              <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
  
  return createPortal(drawerContent, document.body);
}

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
  loading = false
}: ConfirmationModalProps) {
  const confirmButtonClasses = variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
              confirmButtonClasses
            )}
          >
            {loading ? 'Загрузка...' : confirmText}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
