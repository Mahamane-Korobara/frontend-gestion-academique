/**
 * Composant réutilisable pour les filtres et recherche
 * Supporte les onglets, recherche texte et filtres multiples
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TabNavigation from './TabNavigation';

export default function ListPageFilters({
  tabs = null,
  activeTab = null,
  onTabChange = null,
  searchValue = '',
  onSearchChange = null,
  searchPlaceholder = 'Rechercher...',
  filterOptions = [],
  selectedFilters = {},
  onFilterChange = null,
  onReset = null,
  showResetButton = true,
}) {
  return (
    <div className="space-y-4">
      {/* Onglets */}
      {tabs && onTabChange && (
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        {/* Recherche */}
        <div>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {showResetButton && onReset && (
              <Button 
                variant="outline" 
                onClick={onReset}
                className="shrink-0"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Filtres supplémentaires */}
        {filterOptions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filterOptions.map((filter) => (
              <select
                key={filter.key}
                value={selectedFilters[filter.key] || ''}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{filter.placeholder}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
