'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Composant Avatar réutilisable pour afficher l'initiale d'un utilisateur
 * @param {string} name - Nom de l'utilisateur
 * @param {string} size - Taille de l'avatar (sm, md, lg)
 * @param {string} variant - Variante de couleur (blue, green, purple, orange)
 */
export default function UserAvatar({ 
  name, 
  size = 'md', 
  variant = 'blue',
  className 
}) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm'
  };

  const variantClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  const initial = name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center font-bold border flex-shrink-0',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {initial}
    </div>
  );
}