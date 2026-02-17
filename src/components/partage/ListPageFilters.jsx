/**
 * Composant réutilisable pour les filtres et recherche
 * Supporte les onglets, recherche texte et filtres multiples
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormMultiSelect from '@/components/forms/FormMultiSelect';
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
  hideSearch = false, 
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

      {/* On n'affiche le conteneur que s'il y a quelque chose à montrer */}
      {(!hideSearch || filterOptions.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          
          {/* Bloc Recherche conditionnel */}
          {!hideSearch && (
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
          )}

          {/* Filtres supplémentaires */}
          {filterOptions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {filterOptions.map((filter) => (
                <FormMultiSelect
                  key={filter.key}
                  id={filter.key}
                  value={selectedFilters[filter.key] || ''}
                  onValueChange={(value) => onFilterChange?.(filter.key, value)}
                  options={filter.options || []}
                  placeholder={filter.placeholder}
                  getOptionLabel={(opt) => opt.label || opt}
                  getOptionValue={(opt) => opt.value || opt}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}