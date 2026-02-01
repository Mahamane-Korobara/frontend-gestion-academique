'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Composants réutilisables
import UserAvatar from '@/components/layout/UserAvatar';
import StatusBadge from '@/components/ui/StatusBadge';
import InfoBadge from '@/components/ui/InfoBadge';
import UserActionsMenu from '@/components/layout/UserActionsMenu';
import UserForm from '@/components/forms/UserForm';
import useModal from '@/lib/hooks/useModal';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';

// Hooks personnalisés
import useUsers from '@/lib/hooks/useUsers';
import useFilieres from '@/lib/hooks/useFilieres';

export default function UtilisateursPage() {
  const [activeTab, setActiveTab] = useState('etudiant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Hooks
  const { users, loading: usersLoading, createUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { activeFilieresOptions, loading: filieresLoading } = useFilieres();

  // Filtrer les données côté client
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      if (user.role.name === 'admin') return false;
      if (user.role.name !== activeTab) return false;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.profile?.matricule || user.profile?.code || '').toLowerCase().includes(searchLower);

      const matchesFilters = Object.entries(selectedFilters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        const profileValue = user.profile?.[key]?.toLowerCase();
        return profileValue === value.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [users, activeTab, searchQuery, selectedFilters]);

  // Handlers
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFilters({});
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetFilters();
  };

  const updateFilter = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await createUser(formData);
      toast.success('Utilisateur créé avec succès');
      createModal.close();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (user) => {
    toast.info('Affichage des détails en cours de développement');
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    editModal.open();
  };

  const handleUpdate = async (formData) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser.id, formData);
      toast.success('Utilisateur modifié avec succès');
      editModal.close();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      deleteModal.close();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      await resetPassword(user.id);
      toast.success(`Email de réinitialisation envoyé à ${user.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation');
    }
  };

  const handleSendEmail = (user) => {
    window.location.href = `mailto:${user.email}`;
  };

  // ============ CONFIGURATION ONGLETS ET COLONNES ============
  const tabs = [
    { id: 'etudiant', label: 'Étudiants', count: users.filter(u => u.role.name === 'etudiant').length },
    { id: 'professeur', label: 'Professeurs', count: users.filter(u => u.role.name === 'professeur').length }
  ];

  const columns = [
    { 
      key: 'user-identity', 
      label: 'UTILISATEUR',
      className: 'min-w-[200px]',
      render: (val, row) => (
        <div className="flex items-center gap-3 py-1">
          <UserAvatar name={row.name} variant="blue" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 tracking-tight truncate">{row.name}</span>
            <span className="text-[10px] text-gray-400 uppercase font-medium">Inscrit en {new Date(row.created_at).getFullYear() || '2025'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'user-contact', 
      label: 'IDENTIFIANT & EMAIL',
      className: 'min-w-[180px] hidden md:table-cell',
      render: (_, row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-700 truncate">{row.profile?.matricule || row.profile?.code || 'N/A'}</span>
          <span className="text-xs text-gray-400 truncate">{row.email}</span>
        </div>
      )
    },
    { 
      key: 'user-specialty', 
      label: 'DÉPARTEMENT',
      className: 'min-w-[140px] hidden lg:table-cell',
      render: (_, row) => (
        <InfoBadge label={row.profile?.filiere || row.profile?.specialite || 'Non défini'} variant="blue" />
      )
    },
    { 
      key: 'user-status', 
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge status={row.profile?.statut || '--'} />
      )
    },
    {
      key: 'user-actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <UserActionsMenu user={row} onView={handleView} onEdit={handleEdit} onSendEmail={handleSendEmail} onResetPassword={handleResetPassword} onDelete={handleDelete} />
        </div>
      )
    }
  ];

  const filterOptions = useMemo(() => {
    if (activeTab === 'etudiant') {
      return [
        { key: 'filiere', placeholder: 'Filière', options: activeFilieresOptions },
        { key: 'statut', placeholder: 'Statut', options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }] }
      ];
    }
    return [
      { key: 'specialite', placeholder: 'Spécialité', options: activeFilieresOptions },
      { key: 'statut', placeholder: 'Statut', options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }] }
    ];
  }, [activeTab, activeFilieresOptions]);

  return (
    <ListPageLayout
      title="Gestion des utilisateurs"
      description="Gérez les comptes étudiants et professeurs."
      actionButton={
        <Button size="sm" className="shadow-sm" onClick={createModal.open}>
          <Plus className="w-4 h-4 mr-2" /> 
          <span className="hidden sm:inline">Ajouter un utilisateur</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      }
      createModal={createModal}
      editModal={editModal}
      deleteModal={deleteModal}
      isSubmitting={isSubmitting}
      selectedItem={selectedUser}
      createModalTitle="Créer un nouvel utilisateur"
      createModalDescription="Remplissez les informations ci-dessous pour créer un nouveau compte."
      createModalContent={
        <UserForm filieres={activeFilieresOptions} onSubmit={handleCreate} onCancel={createModal.close} loading={isSubmitting} />
      }
      editModalTitle="Modifier l'utilisateur"
      editModalDescription="Mettez à jour les informations de l'utilisateur."
      editModalContent={
        selectedUser && (
          <UserForm user={selectedUser} filieres={activeFilieresOptions} onSubmit={handleUpdate} onCancel={() => { editModal.close(); setSelectedUser(null); }} loading={isSubmitting} />
        )
      }
      deleteModalItemName={selectedUser?.name}
      onDeleteConfirm={handleConfirmDelete}
    >
      <ListPageFilters 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Nom ou matricule..."
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      <DataTableSection
        title={`Liste des ${activeTab === 'etudiant' ? 'étudiants' : 'professeurs'}`}
        columns={columns}
        data={filteredData}
        loading={usersLoading || filieresLoading}
        count={filteredData.length}
      />
    </ListPageLayout>
  );
}