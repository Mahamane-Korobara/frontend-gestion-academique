'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormSelect from '@/components/forms/FormMultiSelect';
import TabNavigation from './TabNavigation';
import { RotateCcw } from 'lucide-react';

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
  inlineFilters = false, 
  stats = null,
}) {
  return (
    <div className="space-y-4">
      {/* Onglets */}
      {tabs && onTabChange && (
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      )}

      {(!hideSearch || filterOptions.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          
          {/* 1. Bloc Recherche (affiché seulement si !hideSearch) */}
          {!hideSearch && (
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              {/* Le bouton ici ne s'affiche que si la recherche est visible */}
              {showResetButton && onReset && (
                <Button variant="outline" onClick={onReset} className="shrink-0">
                  Réinitialiser
                </Button>
              )}
            </div>
          )}

          {/* 2. Bloc Filtres */}
          {filterOptions.length > 0 && (
            <div className={`flex flex-wrap items-center gap-3 ${inlineFilters ? 'flex-row' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              
              {inlineFilters && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Filtrer :
                </span>
              )}

              {filterOptions.map((filter) => (
                <div key={filter.key} style={inlineFilters ? { width: filter.width || '160px' } : {}}>
                  <FormSelect
                    id={filter.key}
                    value={selectedFilters[filter.key] || ''}
                    onValueChange={(value) => onFilterChange?.(filter.key, value)}
                    options={[{ value: '', label: `Tous les ${filter.label?.toLowerCase() || ''}` }, ...(filter.options || [])]}
                    placeholder={filter.placeholder || filter.label}
                  />
                </div>
              ))}

              {/*Placé ici pour être visible même quand hideSearch est true */}
              {hideSearch && showResetButton && onReset && (
                <Button  variant="outline" onClick={onReset} className="shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-xs">Réinitialiser</span>
                </Button>
              )}

              {/* Affichage des stats (Compteur) */}
              {stats && (
                <div className="ml-auto bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                   <span className="text-[11px] text-gray-400 font-medium">
                    {stats.total} créneau{stats.total > 1 ? 'x' : ''} {stats.jours && `· ${stats.jours} jours`}
                   </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}