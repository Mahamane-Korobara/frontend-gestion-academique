'use client';

import { useState, useMemo } from 'react';
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

// Hook personnalisé
import useUsers from '@/lib/hooks/useUsers';

export default function UtilisateursPage() {
  const [activeTab, setActiveTab] = useState('etudiant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});

  // Utilisation du hook useUsers pour récupérer les données de l'API
  const {
    users,
  } = useUsers();

  // Filtrer les données en fonction de l'onglet actif et des filtres
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      // Filtre par rôle (onglet actif) - exclure les admins
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

  // Changer d'onglet et réinitialiser
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetFilters();
  };

  // Mettre à jour un filtre spécifique
  const updateFilter = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handlers pour les actions utilisateur
  const handleView = (user) => {
    console.log('Voir détails:', user);
    // TODO: Ouvrir modal ou naviguer vers la page de détails
  };

  const handleEdit = (user) => {
    console.log('Modifier:', user);
    // TODO: Ouvrir modal d'édition
  };

  const handleDelete = (user) => {
    console.log('Supprimer:', user);
    // TODO: Afficher confirmation puis supprimer
  };

  const handleResetPassword = (user) => {
    console.log('Réinitialiser mot de passe:', user);
    // TODO: Envoyer email de réinitialisation
  };

  const handleSendEmail = (user) => {
    console.log('Envoyer email:', user);
    // TODO: Ouvrir modal de composition d'email
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

  // Configuration des colonnes du tableau
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
              Inscrit en 2025
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
            {row.profile?.matricule || row.profile?.code}
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
          label={row.profile?.filiere || row.profile?.specialite} 
          variant="blue" 
        />
      )
    },
    { 
      key: 'user-status', 
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge status={row.profile?.statut || 'Inactif'} />
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
          <Button size="sm" className=" shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">Ajouter un nouveau utilisateur</span>
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
              options: [{ value: 'informatique', label: 'Informatique' }] 
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}