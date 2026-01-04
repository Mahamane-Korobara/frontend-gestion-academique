import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge les classes CSS Tailwind intelligemment
 * Évite les conflits entre classes (ex: px-4 px-2 -> garde seulement px-2)
 * 
 * @param {...any} inputs - Classes CSS à merger
 * @returns {string} - Classes mergées
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // -> 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // -> conditionnel
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}