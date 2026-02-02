'use client';

import { useState, useCallback } from 'react';
import { professeurDashboardService } from '@/lib/services/professeurDashboard.service';
import useApi from './useApi';

export const useProfesseurDashboard = () => {
    const [filters, setFilters] = useState({
        semestreId: null,
        niveauId: null,
    });

    // Utiliser useApi pour gérer l'état du dashboard
    const {
        data: dashboardData,
        loading,
        error,
        execute
    } = useApi(professeurDashboardService.getStats);

    // Appliquer les filtres
    const applyFilters = useCallback(async (newFilters) => {
        setFilters(newFilters);
    }, []);

    // Structure les données retournées selon la réponse API
    const structured = dashboardData?.dashboard ? {
        resume: dashboardData.dashboard.resume || {
            cours_enseignes: 0,
            etudiants_suivis: 0,
            notes_en_attente: 0,
        },
        prochainsCours: dashboardData.dashboard.prochains_cours || [],
        recentActivities: dashboardData.dashboard.recent_activities || [],
        statsCours: dashboardData.dashboard.stats_cours || [],
        lastUpdated: dashboardData.last_updated,
    } : null;

    return {
        dashboard: structured,
        loading,
        error,
        refetch: execute,
        filters,
        applyFilters,
    };
};

export default useProfesseurDashboard;
