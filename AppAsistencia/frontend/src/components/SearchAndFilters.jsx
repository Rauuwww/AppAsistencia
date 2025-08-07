import React from 'react';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters = {}, 
  onFilterChange,
  placeholder = "Buscar...",
  showFilters = true 
}) => {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        {showFilters && Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, filter]) => (
              <div key={key} className="flex items-center space-x-2">
                <label className="text-sm text-text-secondary whitespace-nowrap">
                  {filter.label}:
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={filter.value || ''}
                    onChange={(e) => onFilterChange(key, e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={filter.value || ''}
                    onChange={(e) => onFilterChange(key, e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={filter.value || ''}
                    onChange={(e) => onFilterChange(key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de resultados */}
      {searchTerm && (
        <div className="mt-3 text-sm text-text-secondary">
          Buscando: <span className="text-text-primary font-medium">"{searchTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;