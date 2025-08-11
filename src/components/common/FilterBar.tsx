import React, { useState } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

type FilterOption = { label: string; value: string };
type DateTimeFilterOption = { label: string; type: 'datetime' };

type FilterOptions = {
  [key: string]: FilterOption[] | DateTimeFilterOption;
};

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  filterOptions?: FilterOptions;
  showExport?: boolean;
  onExport?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  onFilterChange,
  filterOptions = {},
  showExport = false,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Lọc
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {Object.values(activeFilters).filter(Boolean).length}
              </span>
            )}
          </button>

          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Bộ lọc</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, option]) => {
              // Type guard for datetime filter
              if (typeof option === 'object' && !Array.isArray(option) && option.type === 'datetime') {
                return (
                  <div key={key} className="flex flex-col mr-2">
                    <label className="text-xs text-gray-600 mb-1">{option.label}</label>
                    <input
                      type="datetime-local"
                      value={activeFilters[key] || ''}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                );
              }
              // Type guard for select filter (array)
              if (Array.isArray(option)) {
                // Use SearchableSelect for district filter
                if (key === 'district') {
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <SearchableSelect
                        options={option}
                        value={activeFilters[key] || ''}
                        onChange={(value) => handleFilterChange(key, value)}
                        label="Phường/Xã"
                        placeholder="Chọn phường/xã"
                        searchPlaceholder="Tìm kiếm phường/xã..."
                      />
                    </div>
                  );
                }
                
                // Use regular select for other filters
                return (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <select
                      value={activeFilters[key] || ''}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả</option>
                      {option.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              // fallback
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
