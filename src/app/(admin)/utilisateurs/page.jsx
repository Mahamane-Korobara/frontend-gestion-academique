'use client';

import { useState, useMemo } from 'react';

import { toast }   from 'sonner';
import { Button }  from '@/components/ui/button';
import { Plus }    from 'lucide-react';

// Composants
import UserAvatar             from '@/components/layout/UserAvatar';
import StatusBadge            from '@/components/ui/StatusBadge';
import InfoBadge              from '@/components/ui/InfoBadge';
import UserActionsMenu        from '@/components/layout/UserActionsMenu';
import UserForm               from '@/components/forms/UserForm';
import NewConversationModal   from '@/components/annonces/NewConversationModal';
import InscriptionNiveauModal from '@/components/users/InscriptionNiveauModal';

import useModal            from '@/lib/hooks/useModal';
import ListPageLayout      from '@/components/partage/ListPageLayout';
import ListPageFilters     from '@/components/partage/ListPageFilters';
import DataTableSection    from '@/components/partage/DataTableSection';

// Hooks
import useUsers               from '@/lib/hooks/useUsers';
import useFilieres            from '@/lib/hooks/useFilieres';
import useNiveaux             from '@/lib/hooks/useNiveaux';
import { useMessages }        from '@/lib/hooks/useMessages';
import { useModalOperations } from '@/lib/hooks/useModalOperations';
import useInscriptions        from '@/lib/hooks/useInscriptions'; // 

// Utilitaires
import {
    getUserIdentifier,
    getUserDepartment,
    getUserStatus,
    getRegistrationYear,
    countUsersByRole,
    filterUsers,
    getFilterOptionsByRole,
} from '@/lib/utils/userHelpers';

export default function UtilisateursPage() {
    const [activeTab, setActiveTab]             = useState('etudiant');
    const [searchQuery, setSearchQuery]         = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [selectedUser, setSelectedUser]       = useState(null);
    const [messageModalUser, setMessageModalUser]     = useState(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    // Modals
    const createModal      = useModal();
    const editModal        = useModal();
    const deleteModal      = useModal();
    const inscriptionModal = useModal();

    // Hooks data
    const { users, loading: usersLoading, createUser, updateUser, deleteUser, resetPassword } = useUsers();
    const { createMessage, loadConversation, fetchUnreadCount } = useMessages();
    const { activeFilieresOptions, loading: filieresLoading }   = useFilieres();
    const { niveauxOptions, getNiveauxByFiliere, loading: niveauxLoading } = useNiveaux();

    const { isSubmitting, handleCreate, handleUpdate, handleDelete, handleSimpleOperation } = useModalOperations();

    //  Hook inscriptions dédié
    const { inscrireCoursNiveau, isSubmitting: isInscribing } = useInscriptions();

    // Données filtrées
    const filteredData = useMemo(
        () => filterUsers(users, activeTab, searchQuery, selectedFilters),
        [users, activeTab, searchQuery, selectedFilters]
    );

    // Filtres
    const resetFilters    = () => { setSearchQuery(''); setSelectedFilters({}); };
    const handleTabChange = (tab) => { setActiveTab(tab); resetFilters(); };
    const updateFilter    = (key, value) => setSelectedFilters(prev => ({ ...prev, [key]: value }));

    const filterOptions = useMemo(
        () => getFilterOptionsByRole(activeTab, activeFilieresOptions),
        [activeTab, activeFilieresOptions]
    );

    // CRUD
    const onCreateUser = (formData) =>
        handleCreate(createUser, formData, createModal, 'Utilisateur créé avec succès');

    const handleView = () =>
        toast.info('Affichage des détails en cours de développement');

    const handleEdit = (user) => { setSelectedUser(user); editModal.open(); };

    const onUpdateUser = (formData) =>
        handleUpdate(updateUser, selectedUser.id, formData, editModal, 'Utilisateur modifié avec succès', () => setSelectedUser(null));

    const onDeleteUser = (user) => { setSelectedUser(user); deleteModal.open(); };

    const handleConfirmDelete = () =>
        handleDelete(deleteUser, selectedUser.id, deleteModal, 'Utilisateur supprimé avec succès', () => setSelectedUser(null));

    const handleResetPassword = (user) =>
        handleSimpleOperation(
            () => resetPassword(user.id),
            `Email de réinitialisation envoyé à ${user.email}`,
            'Erreur lors de la réinitialisation'
        );

    // Message
    const handleSendMessage = (user) => { setMessageModalUser(user); setIsMessageModalOpen(true); };

    const handleSendMessageAndCreateConversation = async (userId, messageContent) => {
        const result = await handleSimpleOperation(
            async () => {
                await createMessage({ destinataire_id: userId, sujet: 'Message', contenu: messageContent });
                await loadConversation(userId);
                await fetchUnreadCount();
            },
            'Message envoyé avec succès',
            "Erreur lors de l'envoi du message"
        );
        if (result.success) { setIsMessageModalOpen(false); setMessageModalUser(null); }
        return result.success;
    };

    // Inscription niveau
    const handleInscrireNiveau = (user) => {
        setSelectedUser(user);
        inscriptionModal.open();
    };

    const handleConfirmInscription = async (etudiantId, payload) => {
        const result = await inscrireCoursNiveau(etudiantId, payload);
        if (result.success) {
            toast.success(`${selectedUser?.name} a été inscrit avec succès à tous les cours du niveau.`);
            inscriptionModal.close();
            setSelectedUser(null);
        } else {
            toast.error(result.error?.message ?? "Erreur lors de l'inscription.");
        }
        return result;
    };

    // Onglets
    const tabs = [
        { id: 'etudiant',   label: 'Étudiants',  count: countUsersByRole(users, 'etudiant') },
        { id: 'professeur', label: 'Professeurs', count: countUsersByRole(users, 'professeur') },
    ];

    // Colonnes
    const columns = [
        {
            key: 'user-identity',
            label: 'UTILISATEUR',
            className: 'min-w-[200px]',
            render: (_, row) => (
                <div className="flex items-center gap-3 py-1">
                    <UserAvatar name={row.name} variant="blue" />
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-800 tracking-tight truncate">{row.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                            Inscrit en {getRegistrationYear(row)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'user-contact',
            label: 'IDENTIFIANT & EMAIL',
            className: 'min-w-[180px] hidden md:table-cell',
            render: (_, row) => (
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-700 truncate">{getUserIdentifier(row)}</span>
                    <span className="text-xs text-gray-400 truncate">{row.email}</span>
                </div>
            ),
        },
        {
            key: 'user-specialty',
            label: 'DÉPARTEMENT',
            className: 'min-w-[140px] hidden lg:table-cell',
            render: (_, row) => <InfoBadge label={getUserDepartment(row)} variant="blue" />,
        },
        {
            key: 'user-status',
            label: 'STATUT',
            className: 'min-w-[100px] hidden sm:table-cell',
            render: (_, row) => <StatusBadge status={getUserStatus(row)} />,
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
                        onEdit={() => handleEdit(row)}
                        onSendMessage={() => handleSendMessage(row)}
                        onResetPassword={() => handleResetPassword(row)}
                        onInscrireNiveau={() => handleInscrireNiveau(row)}
                        onDelete={() => onDeleteUser(row)}
                    />
                </div>
            ),
        },
    ];

    const userFormProps = {
        filieres: activeFilieresOptions,
        niveauxOptions,
        getNiveauxByFiliere,
    };

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
                <UserForm
                    {...userFormProps}
                    onSubmit={onCreateUser}
                    onCancel={createModal.close}
                    loading={isSubmitting}
                />
            }
            editModalTitle="Modifier l'utilisateur"
            editModalDescription="Mettez à jour les informations de l'utilisateur."
            editModalContent={
                selectedUser && (
                    <UserForm
                        {...userFormProps}
                        user={selectedUser}
                        onSubmit={onUpdateUser}
                        onCancel={() => { editModal.close(); setSelectedUser(null); }}
                        loading={isSubmitting}
                    />
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
                loading={usersLoading || filieresLoading || niveauxLoading}
                count={filteredData.length}
            />

            {/* Modal message */}
            <NewConversationModal
                isOpen={isMessageModalOpen}
                onClose={() => { setIsMessageModalOpen(false); setMessageModalUser(null); }}
                users={messageModalUser ? [messageModalUser] : []}
                usersLoading={false}
                usersError={null}
                initialUserId={messageModalUser?.id}
                onSelectUserAndSendMessage={handleSendMessageAndCreateConversation}
            />

            {/* Modal inscription niveau */}
            <InscriptionNiveauModal
                isOpen={inscriptionModal.isOpen}
                onClose={() => { inscriptionModal.close(); setSelectedUser(null); }}
                etudiant={selectedUser}
                filieresOptions={activeFilieresOptions}
                getNiveauxByFiliere={getNiveauxByFiliere}
                onSubmit={handleConfirmInscription}
                isSubmitting={isInscribing}
            />
        </ListPageLayout>
    );
}