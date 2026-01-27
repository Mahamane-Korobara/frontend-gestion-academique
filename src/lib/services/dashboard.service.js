/**
 * Service pour le tableau de bord admin
 */

import apiClient from '@/lib/api/client';

export const dashboardService = {
    /**
     * Récupérer les statistiques complètes du dashboard
     * Retourne: filtres, résumé, charts, données académiques, activités, alertes
     */
    getStats: () => apiClient.get('/admin/dashboard'),

    /**
     * Récupérer les statistiques avec des filtres
     */
    getStatsByFilters: (filters) => {
        return apiClient.get('/admin/dashboard', filters);
    },
};