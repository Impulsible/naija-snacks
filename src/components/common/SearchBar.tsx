import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for Puff-Puff, Chin Chin, Meat Pie..."
        className="input-field pl-12 pr-12 py-4 text-lg"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-dark transition-colors"
          aria-label="Clear search"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;