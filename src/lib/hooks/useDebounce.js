'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur
 * Utile pour les champs de recherche
 * 
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en ms (défaut: 500)
 * @returns {any} - Valeur debouncée
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Rechercher seulement après 500ms sans changement
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 */
export default function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Créer un timer
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Nettoyer le timer si value change avant le délai
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}