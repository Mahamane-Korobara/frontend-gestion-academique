'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Badge de statut réutilisable
 * @param {string} status - Statut à afficher (Actif, Inactif, En cours, etc.)
 * @param {string} variant - Variante de couleur (success, warning, danger, info)
 * @param {boolean} showDot - Afficher le point indicateur
 */
export default function StatusBadge({ 
  status, 
  variant = 'default',
  showDot = true,
  className 
}) {
  const variantClasses = {
    success: 'text-green-600 bg-green-50 border-green-100',
    warning: 'text-orange-600 bg-orange-50 border-orange-100',
    danger: 'text-red-600 bg-red-50 border-red-100',
    info: 'text-blue-600 bg-blue-50 border-blue-100',
    default: 'text-gray-600 bg-gray-50 border-gray-100'
  };

  const dotClasses = {
    success: 'bg-green-600',
    warning: 'bg-orange-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
    default: 'bg-gray-400'
  };

  // Auto-détection du variant basé sur le statut
  const autoVariant = status?.toLowerCase() === 'actif' ? 'success' : 
                      status?.toLowerCase() === 'inactif' ? 'default' :
                      status?.toLowerCase() === 'en cours' ? 'warning' :
                      variant;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap border',
        variantClasses[autoVariant],
        className
      )}
    >
      {showDot && (
        <span 
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotClasses[autoVariant]
          )} 
        />
      )}
      {status}
    </div>
  );
}