'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
          <Input
            type="text"
            value={searchValue}
            placeholder={searchPlaceholder}
            className="h-9 w-full pl-9 pr-3"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Bouton Reset (visible sur mobile si des filtres sont actifs) */}
        {(searchValue || Object.keys(selectedValues).length > 0) && (
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="sm:hidden shrink-0 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-3 h-3" />
          </Button>
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
                <SelectTrigger className="w-32.5 sm:w-35 bg-white text-xs h-9">
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
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="hidden sm:flex text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 shrink-0"
          >
            <X className="w-3 h-3" /> 
            <span className="hidden md:inline">Réinitialiser</span>
          </Button>
        </div>
      )}
    </div>
  );
}