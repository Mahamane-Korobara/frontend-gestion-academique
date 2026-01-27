// src/app/(admin)/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import useDashboard from '@/lib/hooks/useDashboard';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardAcademique from '@/components/dashboard/DashboardAcademique';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import Header from '@/components/layout/Header';

export default function AdminDashboard() {
  const { dashboard, loading, error, refetch } = useDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Afficher les états de chargement et erreur
  if (loading || error || !dashboard) {
    return <DashboardLoadingState isLoading={loading} isError={error || !dashboard} />;
  }

  const { resume, charts, academique, recentActivities, alerts, anneeAcademique } = dashboard;

  return (
    <div className="p-6 space-y-6">
      <Header 
        title="Vue d'ensemble du tableau de bord" 
        description={`${anneeAcademique?.annee} - ${anneeAcademique?.semestre_actif}`}
      />

      {/* Alertes avec appels à l'action */}
      <DashboardAlerts alerts={alerts} />

      {/* Actions Rapides */}
      <DashboardQuickActions />

      {/* Statistiques principales */}
      <DashboardStats resume={resume} />

      {/* Données académiques */}
      <DashboardAcademique academique={academique} />

      {/* Graphiques */}
      <DashboardCharts charts={charts} />

      {/* Activités Récentes */}
      {recentActivities && recentActivities.length > 0 && (
        <RecentActivity activities={recentActivities} />
      )}
    </div>
  );
}