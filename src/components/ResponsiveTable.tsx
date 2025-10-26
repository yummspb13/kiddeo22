'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg';
}

export default function ResponsiveTable({
  children,
  className,
  variant = 'default',
  size = 'md',
  responsive = true,
  breakpoint = 'md'
}: ResponsiveTableProps) {
  const baseClasses = 'w-full border-collapse';
  
  const variantClasses = {
    default: 'bg-white',
    striped: 'bg-white [&_tbody_tr:nth-child(even)]:bg-gray-50',
    bordered: 'border border-gray-200'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const responsiveClasses = responsive 
    ? `hidden ${breakpoint}:table` 
    : 'table';
  
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        responsiveClasses
      )}>
        {children}
      </table>
    </div>
  );
}

// Responsive Table Header
interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function ResponsiveTableHeader({
  children,
  className,
  sticky = false
}: ResponsiveTableHeaderProps) {
  return (
    <thead className={cn(
      'bg-gray-50',
      sticky && 'sticky top-0 z-10'
    )}>
      <tr className={className}>
        {children}
      </tr>
    </thead>
  );
}

// Responsive Table Header Cell
interface ResponsiveTableHeaderCellProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
}

export function ResponsiveTableHeaderCell({
  children,
  className,
  sortable = false,
  sortDirection,
  onSort,
  align = 'left'
}: ResponsiveTableHeaderCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <th
      className={cn(
        'px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200',
        alignClasses[align],
        sortable && 'cursor-pointer hover:bg-gray-100 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp className={cn(
              'w-3 h-3',
              sortDirection === 'asc' ? 'text-red-600' : 'text-gray-400'
            )} />
            <ChevronDown className={cn(
              'w-3 h-3 -mt-1',
              sortDirection === 'desc' ? 'text-red-600' : 'text-gray-400'
            )} />
          </div>
        )}
      </div>
    </th>
  );
}

// Responsive Table Body
interface ResponsiveTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableBody({
  children,
  className
}: ResponsiveTableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

// Responsive Table Row
interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function ResponsiveTableRow({
  children,
  className,
  hover = true,
  selected = false,
  onClick
}: ResponsiveTableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        hover && 'hover:bg-gray-50',
        selected && 'bg-red-50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Responsive Table Cell
interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
}

export function ResponsiveTableCell({
  children,
  className,
  align = 'left',
  numeric = false
}: ResponsiveTableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td className={cn(
      'px-4 py-3 text-sm text-gray-900',
      alignClasses[align],
      numeric && 'font-mono',
      className
    )}>
      {children}
    </td>
  );
}

// Mobile Card View (для responsive таблиц)
interface MobileCardViewProps {
  data: Array<{
    id: string;
    [key: string]: any;
  }>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, item: any) => ReactNode;
    className?: string;
  }>;
  className?: string;
  onRowClick?: (item: any) => void;
}

export function MobileCardView({
  data,
  columns,
  className,
  onRowClick
}: MobileCardViewProps) {
  return (
    <div className={cn('space-y-4 md:hidden', className)}>
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          onClick={() => onRowClick?.(item)}
        >
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">
                  {column.label}
                </span>
                <span className={cn(
                  'text-sm text-gray-900 text-right flex-1 ml-4',
                  column.className
                )}>
                  {column.render 
                    ? column.render(item[column.key], item)
                    : item[column.key]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Responsive Table Container
interface ResponsiveTableContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  pagination?: ReactNode;
}

export function ResponsiveTableContainer({
  children,
  className,
  title,
  description,
  actions,
  searchable = false,
  onSearch,
  pagination
}: ResponsiveTableContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };
  
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Header */}
      {(title || description || actions || searchable) && (
        <div className="px-4 py-4 border-b border-gray-200 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {searchable && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}
              {actions && (
                <div className="flex gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        {children}
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-4 border-t border-gray-200 md:px-6">
          {pagination}
        </div>
      )}
    </div>
  );
}
