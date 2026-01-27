'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TableFilters({
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  filters = [],
  onSearchChange,
  onFilterChange,
  selectedValues = {},
  onReset,
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 py-3 sm:py-4 w-full bg-white rounded-xl border px-3 sm:px-4">
      
      {/* Ligne 1 : Recherche + Bouton Reset (mobile) */}
      <div className="flex items-center gap-2 w-full">
        {/* Zone de Recherche */}
        <div className="relative flex-1">
          <div className="absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Bouton Reset (visible sur mobile si des filtres sont actifs) */}
        {(searchValue || Object.keys(selectedValues).length > 0) && (
          <button
            onClick={onReset}
            className="sm:hidden flex-shrink-0 h-9 px-3 text-xs text-red-500 font-medium hover:text-red-600 hover:bg-red-50 transition-colors rounded-md flex items-center gap-1 border border-red-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Ligne 2 : Filtres + Reset (desktop) */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
          {/* Label "Filtrer par" - visible uniquement sur desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Filter className="w-4 h-4" />
            <span>Filtrer par:</span>
          </div>

          {/* Filtres dynamiques */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {filters.map((filter) => (
              <Select 
                key={filter.key} 
                value={selectedValues[filter.key] || ""}
                onValueChange={(val) => onFilterChange?.(filter.key, val)}
              >
                <SelectTrigger className="w-[130px] sm:w-[140px] bg-white text-xs h-9">
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Bouton Reset - Desktop */}
          <button
            onClick={onReset}
            className="hidden sm:flex text-xs sm:text-sm text-red-500 font-medium hover:text-red-600 hover:bg-red-50 transition-colors px-2 sm:px-3 py-1.5 rounded-md items-center gap-1 border border-red-200 flex-shrink-0"
          >
            <X className="w-3 h-3" /> 
            <span className="hidden md:inline">Réinitialiser</span>
          </button>
        </div>
      )}
    </div>
  );
}