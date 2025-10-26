'use client';

import { ReactNode, FormHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
  layout?: 'single' | 'two-column' | 'three-column';
  spacing?: 'sm' | 'md' | 'lg';
}

export default function ResponsiveForm({
  children,
  className,
  layout = 'single',
  spacing = 'md',
  ...props
}: ResponsiveFormProps) {
  const layoutClasses = {
    single: 'space-y-4 md:space-y-6',
    'two-column': 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
    'three-column': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
  };
  
  const spacingClasses = {
    sm: 'p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };
  
  return (
    <form
      className={cn(
        'w-full',
        layoutClasses[layout],
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}

// Responsive Form Field
interface ResponsiveFormFieldProps {
  children: ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function ResponsiveFormField({
  children,
  label,
  error,
  required,
  className,
  fullWidth = false
}: ResponsiveFormFieldProps) {
  return (
    <div className={cn(
      'space-y-2',
      fullWidth ? 'col-span-1 md:col-span-2' : '',
      className
    )}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Responsive Input
interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export function ResponsiveInput({
  variant = 'default',
  size = 'md',
  className,
  ...props
}: ResponsiveInputProps) {
  const baseClasses = 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white hover:border-gray-400',
    filled: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    outlined: 'border-2 border-gray-300 bg-white hover:border-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]'
  };
  
  return (
    <input
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

// Responsive Textarea
interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function ResponsiveTextarea({
  variant = 'default',
  size = 'md',
  resize = 'vertical',
  className,
  ...props
}: ResponsiveTextareaProps) {
  const baseClasses = 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white hover:border-gray-400',
    filled: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    outlined: 'border-2 border-gray-300 bg-white hover:border-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[80px]',
    md: 'px-4 py-3 text-base min-h-[120px]',
    lg: 'px-6 py-4 text-lg min-h-[160px]'
  };
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  return (
    <textarea
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        resizeClasses[resize],
        className
      )}
      {...props}
    />
  );
}

// Responsive Select
interface ResponsiveSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function ResponsiveSelect({
  variant = 'default',
  size = 'md',
  options,
  placeholder,
  className,
  ...props
}: ResponsiveSelectProps) {
  const baseClasses = 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white hover:border-gray-400',
    filled: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    outlined: 'border-2 border-gray-300 bg-white hover:border-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]'
  };
  
  return (
    <select
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Responsive Button
interface ResponsiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
}

export function ResponsiveButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ResponsiveButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]',
    xl: 'px-8 py-5 text-xl min-h-[64px]'
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
