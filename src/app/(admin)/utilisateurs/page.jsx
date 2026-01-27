'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import TableFilters from '@/components/partage/TableFilters';
import DataTable from '@/components/partage/DataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Composants réutilisables
import UserAvatar from '@/components/UserAvatar';
import StatusBadge from '@/components/StatusBadge';
import InfoBadge from '@/components/InfoBadge';
import UserActionsMenu from '@/components/UserActionsMenu';
import TabNavigation from '@/components/TabNavigation';
import Modal from '@/components/Modal';
import UserForm from '@/components/UserForm';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import useModal from '@/lib/hooks/useModal';

// Hook personnalisé
import useUsers from '@/lib/hooks/useUsers';

export default function UtilisateursPage() {
  const [activeTab, setActiveTab] = useState('etudiant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  
  // États pour les modals
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  
  // État pour l'utilisateur sélectionné
  const [selectedUser, setSelectedUser] = useState(null);
  
  // États de chargement
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook pour récupérer et gérer les utilisateurs
  const {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useUsers();

  // Filtrer les données côté client
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      // Exclure les admins
      if (user.role.name === 'admin') return false;
      
      // Filtre par rôle (onglet actif)
      if (user.role.name !== activeTab) return false;

      // Filtre par recherche
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.profile?.matricule || user.profile?.code || '').toLowerCase().includes(searchLower);

      // Filtre par critères sélectionnés
      const matchesFilters = Object.entries(selectedFilters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        const profileValue = user.profile?.[key]?.toLowerCase();
        return profileValue === value.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [users, activeTab, searchQuery, selectedFilters]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFilters({});
  };

  // Changer d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetFilters();
  };

  // Mettre à jour un filtre
  const updateFilter = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  // ============ HANDLERS CRUD ============

  /**
   * Créer un utilisateur
   */
  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await createUser(formData);
      toast.success('Utilisateur créé avec succès');
      createModal.close();
    } catch (error) {
      console.error('Erreur création:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de la création';
      toast.error(`${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Voir les détails d'un utilisateur
   */
  const handleView = (user) => {
    console.log('Voir détails:', user);
    // TODO: Implémenter la vue détaillée ou naviguer vers /users/{id}
    toast.info('Affichage des détails en cours de développement');
  };

  /**
   * Ouvrir le modal de modification
   */
  const handleEdit = (user) => {
    setSelectedUser(user);
    editModal.open();
  };

  /**
   * Mettre à jour un utilisateur
   */
  const handleUpdate = async (formData) => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await updateUser(selectedUser.id, formData);
      toast.success('Utilisateur modifié avec succès');
      editModal.close();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur modification:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de la modification';
      toast.error(`${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Ouvrir le modal de suppression
   */
  const handleDelete = (user) => {
    setSelectedUser(user);
    deleteModal.open();
  };

  /**
   * Confirmer la suppression
   */
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      deleteModal.close();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de la suppression';
      toast.error(`${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Réinitialiser le mot de passe
   */
  const handleResetPassword = async (user) => {
    try {
      await resetPassword(user.id);
      toast.success(`Email de réinitialisation envoyé à ${user.email}`);
    } catch (error) {
      console.error('Erreur reset password:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation';
      toast.error(`${message}`);
    }
  };

  /**
   * Envoyer un email
   */
  const handleSendEmail = (user) => {
    window.location.href = `mailto:${user.email}`;
  };

  // Configuration des onglets
  const tabs = [
    {
      id: 'etudiant',
      label: 'Étudiants',
      count: users.filter(u => u.role.name === 'etudiant').length
    },
    {
      id: 'professeur',
      label: 'Professeurs',
      count: users.filter(u => u.role.name === 'professeur').length
    }
  ];

  // Configuration des colonnes
  const columns = [
    { 
      key: 'user-identity', 
      label: 'UTILISATEUR',
      className: 'min-w-[200px]',
      render: (val, row) => (
        <div className="flex items-center gap-3 py-1">
          <UserAvatar name={row.name} variant="blue" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 tracking-tight truncate">
              {row.name}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-medium">
              Inscrit en {new Date(row.created_at).getFullYear() || '2025'}
            </span>
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
          <span className="text-sm font-semibold text-gray-700 truncate">
            {row.profile?.matricule || row.profile?.code || 'N/A'}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {row.email}
          </span>
        </div>
      )
    },
    { 
      key: 'user-specialty', 
      label: 'DÉPARTEMENT',
      className: 'min-w-[140px] hidden lg:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={row.profile?.filiere || row.profile?.specialite || 'Non défini'} 
          variant="blue" 
        />
      )
    },
    { 
      key: 'user-status', 
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge status={row.profile?.statut || '-'} />
      )
    },
    {
      key: 'user-actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <UserActionsMenu
            user={row}
            onView={handleView}
            onEdit={handleEdit}
            onSendEmail={handleSendEmail}
            onResetPassword={handleResetPassword}
            onDelete={handleDelete}
          />
        </div>
      )
    }
  ];

  return (
    <div>
      <Header 
        title="Gestion des utilisateurs" 
        description="Gérez les comptes étudiants et professeurs."
        actions={
          <Button 
            size="sm" 
            className="shadow-sm"
            onClick={createModal.open}
          >
            <Plus className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">Ajouter un utilisateur</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {/* Navigation par onglets */}
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Filtres de recherche */}
        <TableFilters 
          searchPlaceholder="Nom ou matricule..."
          searchValue={searchQuery}
          filters={[
            { 
              key: activeTab === 'etudiant' ? 'filiere' : 'specialite', 
              placeholder: activeTab === 'etudiant' ? 'Filière' : 'Spécialité', 
              options: [
                { value: 'informatique', label: 'Informatique' },
                { value: 'mathematiques', label: 'Mathématiques' },
                { value: 'physique', label: 'Physique' }
              ] 
            },
            { 
              key: 'statut', 
              placeholder: 'Statut', 
              options: [
                { value: 'actif', label: 'Actif' }, 
                { value: 'inactif', label: 'Inactif' }
              ] 
            }
          ]}
          selectedValues={selectedFilters}
          onSearchChange={setSearchQuery}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">
                Liste des {activeTab === 'etudiant' ? 'étudiants' : 'professeurs'}
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded border border-gray-100">
                {filteredData.length}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <DataTable 
              columns={columns}
              data={filteredData}
              itemsPerPage={10}
              title={null}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Modal de création */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Créer un nouvel utilisateur"
        description="Remplissez les informations ci-dessous pour créer un nouveau compte."
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        showCloseButton={!isSubmitting}
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={createModal.close}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de modification */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.close();
          setSelectedUser(null);
        }}
        title="Modifier l'utilisateur"
        description="Mettez à jour les informations de l'utilisateur."
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        showCloseButton={!isSubmitting}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleUpdate}
          onCancel={() => {
            editModal.close();
            setSelectedUser(null);
          }}
          loading={isSubmitting}
        />
      </Modal>

      {/* Modal de suppression */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={isSubmitting}
        itemName={selectedUser?.name}
      />
    </div>
  );
}