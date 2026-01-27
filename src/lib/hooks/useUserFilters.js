'use client';

import { useState, useMemo } from 'react';

/**
 * Hook personnalisé pour gérer le filtrage des utilisateurs
 * @param {Array} users - Liste complète des utilisateurs
 * @param {string} initialTab - Onglet initial actif
 */
export function useUserFilters(users = [], initialTab = 'etudiant') {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});

    // Logique de filtrage
    const filteredData = useMemo(() => {
        return users.filter((user) => {
            // Filtre par rôle (onglet actif)
            if (user.role.name !== activeTab) return false;

            // Filtre par recherche
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                (user.profile?.matricule || user.profile?.code || '').toLowerCase().includes(searchLower);

            // Filtre par critères sélectionnés
            const matchesFilters = Object.entries(selectedFilters).every(([key, value]) => {
                if (!value || value === 'all') return true;
                const profileValue = user.profile?.[key]?.toLowerCase();
                return profileValue === value.toLowerCase();
            });

            return matchesSearch && matchesFilters;
        });
    }, [users, activeTab, searchQuery, selectedFilters]);

    // Réinitialiser les filtres
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedFilters({});
    };

    // Changer d'onglet et réinitialiser
    const changeTab = (tab) => {
        setActiveTab(tab);
        resetFilters();
    };

    // Mettre à jour un filtre spécifique
    const updateFilter = (key, value) => {
        setSelectedFilters(prev => ({ ...prev, [key]: value }));
    };

    return {
        activeTab,
        searchQuery,
        selectedFilters,
        filteredData,
        setActiveTab: changeTab,
        setSearchQuery,
        setSelectedFilters,
        updateFilter,
        resetFilters
    };
}