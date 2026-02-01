'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import AnnonceActionsMenu from '@/components/partage/AnnonceActionsMenu';

// Nouveaux Composants de Section
import AnnoncesSection from '@/components/annonces/AnnoncesSection';
import MessagerieSection from '@/components/annonces/MessagerieSection';
import NotificationsSection from '@/components/annonces/NotificationsSection';
import AnnonceViewModal from '@/components/annonces/AnnonceViewModal';
import AnnonceEditModal from '@/components/annonces/AnnonceEditModal';

// Hooks
import useAnnonces from '@/lib/hooks/useAnnonces';
import useModal from '@/lib/hooks/useModal';

export default function AnnoncesPage() {
  const [activeTab, setActiveTab] = useState('globale');
  const [activeMainSection, setActiveMainSection] = useState('annonces');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

  const viewModal = useModal();
  const deleteModal = useModal();
  const editModal = useModal();

  const { annonces, loading, deleteAnnonce } = useAnnonces();

  // ============ LOGIQUE DE DONNÉES ============
  const stats = useMemo(() => ({
    totalEnvoyees: annonces.filter(a => a.is_active).length
  }), [annonces]);

  const filteredData = useMemo(() => {
    return annonces.filter((annonce) => {
      if (activeTab !== 'all' && annonce.type.code !== activeTab) return false;
      const searchLower = searchQuery.toLowerCase();
      return (
        annonce.titre?.toLowerCase().includes(searchLower) || 
        annonce.contenu?.toLowerCase().includes(searchLower)
      );
    });
  }, [annonces, activeTab, searchQuery]);

  // ============ HANDLERS ============
  const handleConfirmDelete = async () => {
    if (!selectedAnnonce) return;
    setIsSubmitting(true);
    try {
      await deleteAnnonce(selectedAnnonce.id);
      toast.success('Annonce supprimée');
      deleteModal.close();
      setSelectedAnnonce(null);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ HELPERS RENDU ============
  const getPriorityIcon = (priorite) => {
    const icons = { urgente: '⚠️', importante: '📢', normale: 'ℹ️' };
    return icons[priorite?.code] || '📌';
  };

  const columns = [
    {
      key: 'annonce-sujet',
      label: 'SUJET',
      className: 'min-w-[280px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-xl">{getPriorityIcon(row.priorite)}</div>
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
      render: (_, row) => {
        const getCibleText = (cible) => {
          if (cible.type === 'globale') return 'Globale';
          if (cible.type === 'filiere') return cible.filiere?.nom || 'Filière';
          if (cible.type === 'niveau') return `${cible.niveau?.nom || 'Niveau'} - ${cible.filiere?.nom || ''}`;
          if (cible.type === 'cours') return cible.cours?.titre || 'Cours';
          return 'Non défini';
        };
        return (
          <InfoBadge 
            label={getCibleText(row.cible)} 
            variant="blue"
          />
        );
      }
    },
    {
      key: 'annonce-statut',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => <StatusBadge status={row.is_active ? 'Envoyé' : 'Brouillon'} variant={row.is_active ? 'success' : 'warning'} />
    },
    {
      key: 'annonce-actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <AnnonceActionsMenu 
            annonce={row} 
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
          <Link href="/annonces/nouveau">
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
            { id: 'globale', label: 'Globale', count: annonces.filter(a => a.type.code === 'globale').length },
            { id: 'filiere', label: 'Par Filière', count: annonces.filter(a => a.type.code === 'filiere').length },
            { id: 'niveau', label: 'Par Niveau', count: annonces.filter(a => a.type.code === 'niveau').length },
            { id: 'cours', label: 'Cours', count: annonces.filter(a => a.type.code === 'cours').length }
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