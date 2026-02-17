'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import useModal from '@/lib/hooks/useModal';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

import useFilieres from '@/lib/hooks/useFilieres';
import useNiveaux  from '@/lib/hooks/useNiveaux';

import FilieresSection from '@/components/filieres-niveaux/FilieresSection';
import NiveauxSection  from '@/components/filieres-niveaux/NiveauxSection';
import FiliereForm     from '@/components/forms/FiliereForm';
import NiveauForm      from '@/components/forms/NiveauForm';

export default function FilieresNiveauxPage() {
  const [activeTab, setActiveTab]       = useState('filieres');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const createModal = useModal();
  const editModal   = useModal();
  const deleteModal = useModal();

  const {
    filieres,
    loading: filieresLoading,
    createFiliere,
    updateFiliere,
    deleteFiliere,
    activeFilieresOptions,
  } = useFilieres();

  const {
    niveaux,
    loading: niveauxLoading,
    createNiveau,
    updateNiveau,
    deleteNiveau,
  } = useNiveaux();

  const {
    isSubmitting,
    validationErrors,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useModalOperations();

  // ─── Handlers communs ─────────────────────────────────────────────────────
  const resetFilters = () => setSearchQuery('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetFilters();
    setSelectedItem(null);
  };

  const handleEdit        = (item) => { setSelectedItem(item); editModal.open(); };
  const handleDeleteClick = (item) => { setSelectedItem(item); deleteModal.open(); };

  // ─── CRUD Filières ─────────────────────────────────────────────────────────
  const onCreateFiliere = (data) =>
    handleCreate(createFiliere, data, createModal, 'Filière créée avec succès');

  const onUpdateFiliere = (data) =>
    handleUpdate(updateFiliere, selectedItem.id, data, editModal,
      'Filière modifiée avec succès', () => setSelectedItem(null));

  const onDeleteFiliere = () =>
    handleDelete(deleteFiliere, selectedItem.id, deleteModal,
      'Filière supprimée avec succès', () => setSelectedItem(null));

  // ─── CRUD Niveaux ──────────────────────────────────────────────────────────
  const onCreateNiveau = (data) =>
    handleCreate(createNiveau, data, createModal, 'Niveau créé avec succès');

  const onUpdateNiveau = (data) =>
    handleUpdate(updateNiveau, selectedItem.id, data, editModal,
      'Niveau modifié avec succès', () => setSelectedItem(null));

  const onDeleteNiveau = () =>
    handleDelete(deleteNiveau, selectedItem.id, deleteModal,
      'Niveau supprimé avec succès', () => setSelectedItem(null));

  // ─── Props formulaires ─────────────────────────────────────────────────────
  const formCommonProps = { serverErrors: validationErrors, loading: isSubmitting };

  // ─── Config par onglet ─────────────────────────────────────────────────────
  const tabConfig = {
    filieres: {
      createTitle:     'Créer une filière',
      createDesc:      'Remplissez les informations pour créer une nouvelle filière.',
      createContent: (
        <FiliereForm {...formCommonProps} onSubmit={onCreateFiliere} onCancel={createModal.close} />
      ),
      editTitle:       'Modifier la filière',
      editDesc:        'Mettez à jour les informations de la filière.',
      editContent: selectedItem && (
        <FiliereForm {...formCommonProps} filiere={selectedItem} onSubmit={onUpdateFiliere}
          onCancel={() => { editModal.close(); setSelectedItem(null); }} />
      ),
      deleteLabel:     selectedItem?.nom,
      onConfirmDelete: onDeleteFiliere,
      buttonLabel:     'Ajouter une filière',
    },
    niveaux: {
      createTitle:     'Créer un niveau',
      createDesc:      'Remplissez les informations pour créer un nouveau niveau.',
      createContent: (
        <NiveauForm {...formCommonProps} filieresOptions={activeFilieresOptions}
          onSubmit={onCreateNiveau} onCancel={createModal.close} />
      ),
      editTitle:       'Modifier le niveau',
      editDesc:        'Mettez à jour les informations du niveau.',
      editContent: selectedItem && (
        <NiveauForm {...formCommonProps} niveau={selectedItem} filieresOptions={activeFilieresOptions}
          onSubmit={onUpdateNiveau} onCancel={() => { editModal.close(); setSelectedItem(null); }} />
      ),
      deleteLabel:     selectedItem?.nom,
      onConfirmDelete: onDeleteNiveau,
      buttonLabel:     'Ajouter un niveau',
    },
  };

  const current = tabConfig[activeTab];

  const tabs = [
    { id: 'filieres', label: 'Filières', count: filieres.length },
    { id: 'niveaux',  label: 'Niveaux',  count: niveaux.length  },
  ];

  return (
    <ListPageLayout
      title="Filières & Niveaux"
      description="Gérez les filières et les niveaux d'études."
      actionButton={
        <Button size="sm" className="shadow-sm" onClick={createModal.open}>
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{current.buttonLabel}</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      }
      createModal={createModal}
      editModal={editModal}
      deleteModal={deleteModal}
      isSubmitting={isSubmitting}
      selectedItem={selectedItem}
      createModalTitle={current.createTitle}
      createModalDescription={current.createDesc}
      createModalContent={current.createContent}
      editModalTitle={current.editTitle}
      editModalDescription={current.editDesc}
      editModalContent={current.editContent}
      deleteModalItemName={current.deleteLabel}
      onDeleteConfirm={current.onConfirmDelete}
    >
      <ListPageFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === 'filieres' ? 'Nom ou code filière...' : 'Nom du niveau ou filière...'
        }
        onReset={resetFilters}
      />

      {activeTab === 'filieres' && (
        <FilieresSection
          filieres={filieres} loading={filieresLoading}
          searchQuery={searchQuery} onEdit={handleEdit} onDelete={handleDeleteClick}
        />
      )}

      {activeTab === 'niveaux' && (
        <NiveauxSection
          niveaux={niveaux} loading={niveauxLoading}
          searchQuery={searchQuery} onEdit={handleEdit} onDelete={handleDeleteClick}
        />
      )}
    </ListPageLayout>
  );
}