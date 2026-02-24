// src/app/(admin)/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import useDashboard from '@/lib/hooks/useDashboard';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DynamicQuickActions from '@/components/dashboard/DynamicQuickActions';
import DashboardStats from '@/components/dashboard/DashboardStats';
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

  const { resume, charts, recentActivities, alerts, anneeAcademique } = dashboard;

  return (
    <div>
      <Header 
        title="Vue d'ensemble du tableau de bord" 
        description={`${anneeAcademique?.annee} - ${anneeAcademique?.semestre_actif}`}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {/* Alertes avec appels à l'action */}
      <DashboardAlerts alerts={alerts} />

      {/* Actions Rapides */}
      <DynamicQuickActions role="admin" />

      {/* Statistiques principales */}
      <DashboardStats resume={resume} />


      {/* Graphiques */}
      <DashboardCharts charts={charts} />

      {/* Activités Récentes */}
      {recentActivities && recentActivities.length > 0 && (
        <RecentActivity activities={recentActivities} />
      )}
      </main>
    </div>
  );
}