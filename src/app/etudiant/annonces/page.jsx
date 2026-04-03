'use client';

import { useMemo, useState } from 'react';
import ListPageLayout from '@/components/partage/ListPageLayout';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import AnnonceActionsMenu from '@/components/partage/AnnonceActionsMenu';
import AnnoncesSection from '@/components/annonces/AnnoncesSection';
import AnnonceViewModal from '@/components/annonces/AnnonceViewModal';
import useAnnonces from '@/lib/hooks/useAnnonces';
import useAuth from '@/lib/hooks/useAuth';
import useModal from '@/lib/hooks/useModal';
import {
  getPriorityIcon,
  getCibleTextFromAnnonce,
  filterAnnonces,
  countAnnoncesByType,
  getAnnonceStats,
  getAnnonceStatusLabel,
  getAnnonceStatusVariant
} from '@/lib/utils/annonceHelpers';

export default function AnnoncesEtudiantPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

  const viewModal = useModal();

  const { user } = useAuth();
  const { annonces, loading } = useAnnonces();

  const stats = useMemo(() => getAnnonceStats(annonces), [annonces]);
  const filteredData = useMemo(() => filterAnnonces(annonces, activeTab, searchQuery), [annonces, activeTab, searchQuery]);

  const columns = [
    {
      key: 'annonce-sujet',
      label: 'SUJET',
      className: 'min-w-[280px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-xl">
            {getPriorityIcon(row.priorite)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">{row.titre}</span>
            <span className="text-xs text-gray-500 truncate line-clamp-1">{row.contenu}</span>
          </div>
        </div>
      )
    },
    {
      key: 'annonce-cible',
      label: 'CIBLE',
      className: 'min-w-[140px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge label={getCibleTextFromAnnonce(row)} variant="blue" />
      )
    },
    {
      key: 'annonce-statut',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge status={getAnnonceStatusLabel(row.is_active)} variant={getAnnonceStatusVariant(row.is_active)} />
      )
    },
    {
      key: 'annonce-actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <AnnonceActionsMenu
            annonce={row}
            currentUserId={user?.id}
            onView={(a) => { setSelectedAnnonce(a); viewModal.open(); }}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      )
    }
  ];

  return (
    <ListPageLayout
      title="Annonces"
      description="Consultez les annonces diffusées."
      viewModal={viewModal}
      viewModalTitle="Détails de l'annonce"
      viewModalContent={<AnnonceViewModal annonce={selectedAnnonce} />}
    >
      <AnnoncesSection
        stats={stats}
        statsTitle="Annonces reçues"
        tabs={[
          { id: 'all', label: 'Toutes', count: annonces.length },
          { id: 'globale', label: 'Globales', count: countAnnoncesByType(annonces, 'globale') },
          { id: 'filiere', label: 'Filière', count: countAnnoncesByType(annonces, 'filiere') },
          { id: 'niveau', label: 'Niveau', count: countAnnoncesByType(annonces, 'niveau') },
          { id: 'cours', label: 'Cours', count: countAnnoncesByType(annonces, 'cours') },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={() => setSearchQuery('')}
        columns={columns}
        filteredData={filteredData}
        loading={loading}
      />
    </ListPageLayout>
  );
}
