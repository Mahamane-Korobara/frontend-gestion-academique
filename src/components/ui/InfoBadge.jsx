'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Badge d'information réutilisable (pour filières, spécialités, catégories, etc.)
 * @param {string} label - Texte à afficher
 * @param {string} variant - Variante de couleur (blue, green, purple, orange, gray)
 * @param {string} size - Taille du badge (sm, md)
 */
export default function InfoBadge({ 
  label, 
  variant = 'blue',
  size = 'md',
  className 
}) {
  const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-0.5 text-[10px]'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-bold border uppercase tracking-wider',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
}