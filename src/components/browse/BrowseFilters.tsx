import React from 'react';
import { Search, Book, X } from 'lucide-react';

interface BrowseFiltersProps {
  activeTab: 'books' | 'search';
  onTabChange: (tab: 'books' | 'search') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const BrowseFilters: React.FC<BrowseFiltersProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange
}) => {
  const tabs = [
    { id: 'books' as const, label: 'Livros', icon: Book },
    { id: 'search' as const, label: 'Buscar', icon: Search }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por palavra-chave ou referência..."
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseFilters;
