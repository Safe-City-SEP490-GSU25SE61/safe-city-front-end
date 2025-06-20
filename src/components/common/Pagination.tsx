import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const PaginationComponent: React.FC<PaginationProps> = ({ 
  totalItems = 150, 
  itemsPerPage = 10, 
  currentPage = 1, 
  onPageChange = () => {} 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Thông tin trang */}
      <div className="text-sm text-gray-600">
        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} kết quả
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Nút Trang trước */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </button>

        {/* Số trang */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page: number | string, index: number) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="px-3 py-2 text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Nút Trang sau */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600'
          }`}
        >
          Sau
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Điều hướng nhanh */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Đi đến trang:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              const page = parseInt(target.value);
              if (page >= 1 && page <= totalPages) {
                handlePageChange(page);
                target.value = '';
              }
            }
          }}
        />
        <span className="text-gray-500">/ {totalPages}</span>
      </div>
    </div>
  );
};