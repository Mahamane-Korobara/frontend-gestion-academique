/**
 * Service pour le tableau de bord professeur
 */

import apiClient from '@/lib/api/client';

export const professeurDashboardService = {
    /**
     * Récupérer les statistiques complètes du dashboard professeur
     * Retourne: résumé, cours prochains, activités récentes, stats des cours
     */
    getStats: () => apiClient.get('/professeur/dashboard'),

    /**
     * Récupérer les statistiques avec des filtres
     */
    getStatsByFilters: (filters) => {
        return apiClient.get('/professeur/dashboard', filters);
    },
};
