'use client';

import { useState, useCallback } from 'react';
import { dashboardService } from '@/lib/services/dashboard.service';
import useApi from './useApi';

export const useDashboard = () => {
    const [filters, setFilters] = useState({
        anneeId: null,
        semestreId: null,
        filiereId: null,
        niveauId: null,
    });

    // Utiliser useApi pour gérer l'état du dashboard
    const {
        data: dashboardData,
        loading,
        error,
        execute
    } = useApi(dashboardService.getStats);

    // Appliquer les filtres
    const applyFilters = useCallback(async (newFilters) => {
        setFilters(newFilters);
        // Optionnel: refetch avec les nouveaux filtres
        // await execute(newFilters);
    }, []);

    // Structure les données retournées
    const structured = dashboardData ? {
        filtresAppliques: dashboardData.filtres_appliques || {},
        filtresDisponibles: dashboardData.filtres_disponibles || {},
        anneeAcademique: dashboardData.annee_academique || {},
        resume: dashboardData.resume || {},
        charts: dashboardData.charts || {},
        academique: dashboardData.academique || {},
        recentActivities: dashboardData.recent_activities || [],
        alerts: dashboardData.alerts || [],
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

export default useDashboard;