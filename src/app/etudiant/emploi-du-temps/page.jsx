'use client';

import ListPageLayout from '@/components/partage/ListPageLayout';
import CalendrierSection from '@/components/calendrier/CalendrierSection';
import useEmploiDuTempsEtudiant from '@/lib/hooks/useEmploiDuTempsEtudiant';

export default function EmploiDuTempsEtudiantPage() {
  const {
    creneaux,
    loading,
    filters,
    totalCours,
    semestresOptions,
    niveauxOptions,
    updateFilter,
    resetFilters,
  } = useEmploiDuTempsEtudiant();

  return (
    <ListPageLayout
      title="Emploi du temps"
      description={`Consultez votre planning. ${totalCours} créneau(x).`}
    >
      <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
        <CalendrierSection
          creneaux={creneaux}
          loading={loading}
          niveauxOptions={niveauxOptions}
          semestresOptions={semestresOptions}
          filieresOptions={[]}
          coursOptions={[]}
          filters={filters}
          onFiltreNiveau={(val) => updateFilter('niveau_id', val)}
          onFiltreSemestre={(val) => updateFilter('semestre_id', val)}
          onFiltreFiliere={() => {}}
          onFiltreCours={() => {}}
          onDelete={null}
        />
      </div>
    </ListPageLayout>
  );
}
