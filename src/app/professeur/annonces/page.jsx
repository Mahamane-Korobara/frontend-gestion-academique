'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import AnnonceActionsMenu from '@/components/partage/AnnonceActionsMenu';

// Composants de Section
import AnnoncesSection from '@/components/annonces/AnnoncesSection';
import MessagerieSection from '@/components/annonces/MessagerieSection';
import NotificationsSection from '@/components/annonces/NotificationsSection';
import AnnonceViewModal from '@/components/annonces/AnnonceViewModal';
import AnnonceEditModal from '@/components/annonces/AnnonceEditModal';

// Hooks
import useAnnonces from '@/lib/hooks/useAnnonces';
import useAuth from '@/lib/hooks/useAuth';
import useModal from '@/lib/hooks/useModal';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

// Helpers
import {
  getPriorityIcon,
  getCibleText,
  filterAnnonces,
  countAnnoncesByType,
  getAnnonceStats,
  getAnnonceStatusLabel,
  getAnnonceStatusVariant
} from '@/lib/utils/annonceHelpers';

export default function AnnoncesPage() {
  const [activeTab, setActiveTab] = useState('globale');
  const [activeMainSection, setActiveMainSection] = useState('annonces');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

  const viewModal = useModal();
  const deleteModal = useModal();
  const editModal = useModal();

  const { user } = useAuth();
  const { annonces, loading, deleteAnnonce } = useAnnonces();
  const { isSubmitting, handleDelete } = useModalOperations();

  // ============ LOGIQUE DE DONNÉES (SIMPLIFIÉE) ============
  const stats = useMemo(() => getAnnonceStats(annonces, user?.id), [annonces, user?.id]);

  const filteredData = useMemo(() => {
    return filterAnnonces(annonces, activeTab, searchQuery);
  }, [annonces, activeTab, searchQuery]);

  // ============ HANDLERS (SIMPLIFIÉS) ============
  const handleConfirmDelete = () => {
    return handleDelete(
      deleteAnnonce,
      selectedAnnonce.id,
      deleteModal,
      'Annonce supprimée avec succès',
      () => setSelectedAnnonce(null)
    );
  };

  // ============ HELPERS RENDU (SIMPLIFIÉS) ============
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
        <InfoBadge 
          label={getCibleText(row.cible)} 
          variant="blue"
        />
      )
    },
    {
      key: 'annonce-statut',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge 
          status={getAnnonceStatusLabel(row.is_active)} 
          variant={getAnnonceStatusVariant(row.is_active)} 
        />
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
            onEdit={(a) => { setSelectedAnnonce(a); editModal.open(); }} 
            onDelete={(a) => { setSelectedAnnonce(a); deleteModal.open(); }} 
          />
        </div>
      )
    }
  ];

  // ============ MODAL CONTENT ============
  const viewModalContent = <AnnonceViewModal annonce={selectedAnnonce} />;
  const editModalContent = <AnnonceEditModal annonce={selectedAnnonce} onClose={editModal.close} />;

  return (
    <ListPageLayout
      title="Centre de Communication"
      description="Gérez les annonces, les notifications et la messagerie interne."
      actionButton={
        activeMainSection === 'annonces' && (
          <Link href="/professeur/annonces/nouveau">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle Annonce
            </Button>
          </Link>
        )
      }
      viewModal={viewModal}
      editModal={editModal}
      deleteModal={deleteModal}
      isSubmitting={isSubmitting}
      selectedItem={selectedAnnonce}
      viewModalTitle="Détails de l'annonce"
      viewModalContent={viewModalContent}
      editModalTitle="Modifier l'annonce"
      editModalContent={editModalContent}
      deleteModalItemName={selectedAnnonce?.titre || 'cette annonce'}
      onDeleteConfirm={handleConfirmDelete}
    >
      <TabNavigation
        tabs={[
          { id: 'annonces', label: 'Annonces' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'messagerie', label: 'Messagerie' },
        ]}
        activeTab={activeMainSection}
        onTabChange={setActiveMainSection}
      />

      {activeMainSection === 'annonces' && (
        <AnnoncesSection 
          stats={stats}
          tabs={[
            { id: 'globale', label: 'Globale', count: countAnnoncesByType(annonces, 'globale') },
            { id: 'filiere', label: 'Par Filière', count: countAnnoncesByType(annonces, 'filiere') },
            { id: 'niveau', label: 'Par Niveau', count: countAnnoncesByType(annonces, 'niveau') },
            { id: 'cours', label: 'Cours', count: countAnnoncesByType(annonces, 'cours') }
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
      )}

      {activeMainSection === 'messagerie' && <MessagerieSection />}
      {activeMainSection === 'notifications' && <NotificationsSection />}
    </ListPageLayout>
  );
}