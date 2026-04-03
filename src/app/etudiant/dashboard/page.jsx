'use client';

import { useEffect, useMemo } from 'react';
import { BookMarked, ClipboardCheck, GraduationCap, IdCard, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardSection from '@/components/dashboard/DashboardSection';
import StatsCard from '@/components/dashboard/StatsCard';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import useEtudiantDashboard from '@/lib/hooks/useEtudiantDashboard';

export default function EtudiantDashboard() {
  const { dashboard, loading, error, refetch } = useEtudiantDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const etudiant = dashboard?.etudiant || {};
  const cours = dashboard?.cours || [];
  const nouvellesNotes = dashboard?.activites_recentes?.nouvelles_notes || [];

  const stats = useMemo(() => ([
    {
      title: 'Cours inscrits',
      value: cours.length,
      icon: BookMarked,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Nouvelles notes',
      value: nouvellesNotes.length,
      icon: ClipboardCheck,
      color: 'bg-green-50 text-green-600',
    },
  ]), [cours.length, nouvellesNotes.length, etudiant]);

  if (loading || error || !dashboard) {
    return <DashboardLoadingState isLoading={loading} isError={error || !dashboard} />;
  }

  return (
    <div>
      <Header
        title="Tableau de bord Étudiant"
        description={`${etudiant?.nom_complet || ''}`.trim() || 'Suivi de votre parcours'}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardSection title="Profil étudiant" description="Informations académiques" icon={User}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Nom complet</span>
                <span className="font-medium text-gray-900">{etudiant?.nom_complet || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Matricule</span>
                <InfoBadge label={etudiant?.matricule || '—'} variant="purple" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Filière</span>
                <InfoBadge label={etudiant?.filiere || '—'} variant="blue" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Niveau</span>
                <InfoBadge label={etudiant?.niveau || '—'} variant="green" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Statut</span>
                <StatusBadge status={etudiant?.statut_academique || 'actif'} variant="success" />
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Dernières notes" description="Les notes validées récemment">
            {nouvellesNotes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Aucune note récente.</div>
            ) : (
              <div className="space-y-3">
                {nouvellesNotes.slice(0, 5).map((note) => (
                  <div key={note.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{note.cours}</p>
                      <p className="text-xs text-gray-500">{note.type_evaluation} · {note.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.is_absent ? (
                        <StatusBadge status="Absent" variant="danger" />
                      ) : (
                        <InfoBadge label={`${note.note}/20`} variant="blue" />
                      )}
                      {note.mention && (
                        <InfoBadge label={note.mention} variant="green" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection title="Cours actuels" description="Cours auxquels vous êtes inscrit">
            {cours.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Aucun cours inscrit.</div>
            ) : (
              <div className="space-y-3">
                {cours.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{c.titre}</p>
                      <p className="text-xs text-gray-500">{c.code}</p>
                    </div>
                    <InfoBadge label={`Coef. ${c.coefficient}`} variant="purple" />
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>
      </main>
    </div>
  );
}
