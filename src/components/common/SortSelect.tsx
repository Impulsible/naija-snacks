import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { SortOption } from '../../utils/filterProducts';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none bg-white border border-gray-200 rounded-full px-6 py-3 pr-12 font-medium cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ArrowUpDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none" size={18} />
    </div>
  );
};

export default SortSelect;