"use client";

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';


export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found',
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortKey];
      const bValue = (b as Record<string, unknown>)[sortKey];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getSortIcon = (key: string, sortable?: boolean) => {
    if (!sortable) return null;
    
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-emerald-900 dark:text-emerald-400" />;
    }
    
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-emerald-900 dark:text-emerald-400" />;
    }
    
    return <ChevronsUpDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />;
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center text-sm">
        <p className="text-zinc-500 dark:text-zinc-400 font-inter">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-sm font-medium text-zinc-900 dark:text-zinc-100 p-4 font-inter ${getAlignClass(column.align)} ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors' : ''
                  }`}
                  ref={(el) => { if (el && column.width) el.style.width = column.width; }}
                  onClick={() => handleSort(column.key, column.sortable)}
                >
                  <div className={`flex items-center gap-1.5 ${
                    column.align === 'center' ? 'justify-center' : 
                    column.align === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{column.label}</span>
                    {getSortIcon(column.key, column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className={`border-b last:border-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-4 text-sm font-inter text-zinc-600 dark:text-zinc-400 ${getAlignClass(column.align)}`}
                    ref={(el) => { if (el && column.width) el.style.width = column.width; }}
                  >
                    {column.render 
                      ? column.render(item, index)
                      : ((item as Record<string, unknown>)[column.key] as React.ReactNode) ?? '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
