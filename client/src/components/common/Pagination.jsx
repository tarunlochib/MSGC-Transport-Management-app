import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate smart page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show only 5 page numbers max
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ type: 'page', value: i });
      }
    } else {
      // Always show first page
      pages.push({ type: 'page', value: 1 });
      
      if (currentPage <= 3) {
        // Near the beginning: 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push({ type: 'page', value: i });
        }
        pages.push({ type: 'ellipsis', value: '...' });
        pages.push({ type: 'page', value: totalPages });
      } else if (currentPage >= totalPages - 2) {
        // Near the end: 1, ..., last-3, last-2, last-1, last
        pages.push({ type: 'ellipsis', value: '...' });
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push({ type: 'page', value: i });
        }
      } else {
        // In the middle: 1, ..., current-1, current, current+1, ..., last
        pages.push({ type: 'ellipsis', value: '...' });
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push({ type: 'page', value: i });
        }
        pages.push({ type: 'ellipsis', value: '...' });
        pages.push({ type: 'page', value: totalPages });
      }
    }
    
    return pages;
  };

  // Jump to first/last page
  const jumpToFirst = () => onPageChange(1);
  const jumpToLast = () => onPageChange(totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Pagination Controls */}
      <div className="flex items-center space-x-2 order-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page.type === 'page' ? (
                <button
                  onClick={() => onPageChange(page.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === page.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  aria-label={`Page ${page.value}`}
                  aria-current={currentPage === page.value ? 'page' : undefined}
                >
                  {page.value}
                </button>
              ) : (
                <span className="px-2 py-2 text-sm text-gray-400 select-none">
                  {page.value}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Page Counter */}
      <div className="text-sm text-gray-500 order-2 whitespace-nowrap">
        <span className="font-medium text-gray-900">{currentPage}</span>
        <span className="text-gray-400"> / </span>
        <span className="font-medium text-gray-900">{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination; 