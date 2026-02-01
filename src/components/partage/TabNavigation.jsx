'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Navigation par onglets réutilisable avec compteurs
 * @param {Array} tabs - Liste des onglets [{id, label, count}]
 * @param {string} activeTab - ID de l'onglet actif
 * @param {Function} onTabChange - Callback lors du changement d'onglet
 */
export default function TabNavigation({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  className 
}) {
  return (
    <div className={cn(
      'flex gap-4 sm:gap-6 md:gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar',
      className
    )}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            variant="ghost"
            className={cn(
              'pb-3 md:pb-4 text-xs sm:text-sm font-bold capitalize relative flex items-center gap-2 transition-all whitespace-nowrap shrink-0 h-auto px-0',
              isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {tab.label}
            
            {tab.count !== undefined && (
              <span className={cn(
                'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold border',
                isSelected 
                  ? 'bg-blue-50 border-blue-100 text-blue-600' 
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              )}>
                {tab.count}
              </span>
            )}
            
            {isSelected && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </Button>
        );
      })}
    </div>
  );
}