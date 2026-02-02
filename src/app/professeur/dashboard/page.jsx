'use client';

import { useEffect } from 'react';
import useProfesseurDashboard from '@/lib/hooks/useProfesseurDashboard';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardProfesseurStats from '@/components/dashboard/DashboardProfesseurStats';
import DynamicQuickActions from '@/components/dashboard/DynamicQuickActions';;
import DashboardProchainsCours from '@/components/dashboard/DashboardProchainsCours';
import DashboardStatsCours from '@/components/dashboard/DashboardStatsCours';
import RecentActivity from '@/components/dashboard/RecentActivity';
import Header from '@/components/layout/Header';

export default function ProfesseurDashboard() {
  const { dashboard, loading, error, refetch } = useProfesseurDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Afficher les états de chargement et erreur
  if (loading || error || !dashboard) {
    return <DashboardLoadingState isLoading={loading} isError={error || !dashboard} />;
  }

  const { 
    resume, 
    prochainsCours, 
    statsCours,
    recentActivities, 
    lastUpdated 
  } = dashboard;

  return (
    <div>
      <Header 
        title="Tableau de bord Professeur" 
        description={`Dernière mise à jour: ${lastUpdated}`}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">

        {/* Actions Rapides */}
        <DynamicQuickActions role="professeur" />

        {/* Statistiques principales */}
        <DashboardProfesseurStats resume={resume} />
        
        {/* Prochains Cours */}
        <DashboardProchainsCours prochainsCours={prochainsCours} />

        {/* Statistiques des Cours */}
        <DashboardStatsCours statsCours={statsCours} />

        {/* Activités Récentes */}
        {recentActivities && recentActivities.length > 0 && (
          <RecentActivity activities={recentActivities} />
        )}
      </main>
    </div>
  );
}
