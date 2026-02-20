'use client';

import { useState } from 'react';
import { Plus, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import useModal               from '@/lib/hooks/useModal';
import ListPageLayout         from '@/components/partage/ListPageLayout';
import ListPageFilters        from '@/components/partage/ListPageFilters';
import { useModalOperations } from '@/lib/hooks/useModalOperations';
import useCycleAcademique     from '@/lib/hooks/useCycleAcademique';
import AnneeAcademiqueForm    from '@/components/forms/AnneeAcademiqueForm';
import SemestreForm           from '@/components/forms/SemestreForm';
import DeleteConfirmModal     from '@/components/partage/DeleteConfirmModal';
import ConfirmModal           from '@/components/ui/ConfirmModal';
import AnneeCard              from '@/components/annee-academiques/AnneeCard';
import ModalWrapper           from '@/components/annee-academiques/ModalWrapper';

//  Page principale 
export default function CycleAcademiquePage() {
    const [activeTab, setActiveTab]     = useState('annees');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem]                         = useState(null);
    const [selectedAnneeForSemestre, setSelectedAnneeForSemestre] = useState(null);

    // Modals années — passés à ListPageLayout (même pattern que FilieresNiveauxPage)
    const createModal = useModal();
    const editModal   = useModal();
    const deleteModal = useModal();

    // Modals semestres
    const createSemestreModal  = useModal();
    const editSemestreModal    = useModal();
    const deleteSemestreModal  = useModal();

    // Modals confirmation (activation / clôture)
    const activateAnneeModal    = useModal();
    const closeAnneeModal       = useModal();
    const activateSemestreModal = useModal();

    const {
        annees, anneesOptions, loading,
        createAnnee, updateAnnee, deleteAnnee, activateAnnee, closeAnnee,
        createSemestre, updateSemestre, deleteSemestre, activateSemestre,
    } = useCycleAcademique();

    const {
        isSubmitting, validationErrors,
        handleCreate, handleUpdate, handleDelete, handleSimpleOperation,
    } = useModalOperations();

    const filteredAnnees = annees.filter(a =>
        !searchQuery || a.annee?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetFilters    = () => setSearchQuery('');
    const handleTabChange = (tab) => { setActiveTab(tab); resetFilters(); };

    const formProps = { serverErrors: validationErrors, loading: isSubmitting };

    //  Actions années 
    const onCreateAnnee = (data) =>
        handleCreate(createAnnee, data, createModal, 'Année académique créée avec succès');

    const onUpdateAnnee = (data) =>
        handleUpdate(updateAnnee, selectedItem.id, data, editModal,
            'Année académique modifiée avec succès', () => setSelectedItem(null));

    const onDeleteAnnee = () =>
        handleDelete(deleteAnnee, selectedItem.id, deleteModal,
            'Année académique supprimée avec succès', () => setSelectedItem(null));

    const handleActivateAnnee = (annee) => {
        setSelectedItem(annee);
        activateAnneeModal.open();
    };
    const confirmActivateAnnee = () =>
        handleSimpleOperation(
            () => activateAnnee(selectedItem.id),
            `${selectedItem.annee} activée avec succès`,
            "Erreur lors de l'activation",
        ).finally(() => { activateAnneeModal.close(); setSelectedItem(null); });

    const handleCloseAnnee = (annee) => {
        setSelectedItem(annee);
        closeAnneeModal.open();
    };
    const confirmCloseAnnee = () =>
        handleSimpleOperation(
            () => closeAnnee(selectedItem.id),
            `${selectedItem.annee} clôturée avec succès`,
            'Erreur lors de la clôture',
        ).finally(() => { closeAnneeModal.close(); setSelectedItem(null); });

    //  Actions semestres 
    const handleAddSemestre = (annee) => {
        setSelectedAnneeForSemestre(annee);
        createSemestreModal.open();
    };

    const onCreateSemestre = (data) =>
        handleCreate(createSemestre, data, createSemestreModal, 'Semestre créé avec succès');

    const handleEditSemestre = (s) => { setSelectedItem(s); editSemestreModal.open(); };

    const onUpdateSemestre = (data) =>
        handleUpdate(updateSemestre, selectedItem.id, data, editSemestreModal,
            'Semestre modifié avec succès', () => setSelectedItem(null));

    const handleDeleteSemestre = (s) => { setSelectedItem(s); deleteSemestreModal.open(); };

    const onDeleteSemestre = () =>
        handleDelete(deleteSemestre, selectedItem.id, deleteSemestreModal,
            'Semestre supprimé avec succès', () => setSelectedItem(null));

    const handleActivateSemestre = (s) => {
        setSelectedItem(s);
        activateSemestreModal.open();
    };
    const confirmActivateSemestre = () =>
        handleSimpleOperation(
            () => activateSemestre(selectedItem.id),
            `Semestre ${selectedItem.numero} activé avec succès`,
            "Erreur lors de l'activation",
        ).finally(() => { activateSemestreModal.close(); setSelectedItem(null); });

    // Année active courante (pour messages de prévention)
    const anneeActive = annees.find(a => a.is_active);

    const tabs = [{ id: 'annees', label: 'Années académiques', count: annees.length }];

    return (
        <ListPageLayout
            title="Cycle Académique"
            description="Gérez les années académiques et leurs semestres."
            actionButton={
                <Button size="sm" className="shadow-sm" onClick={createModal.open}>
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Nouvelle année</span>
                    <span className="sm:hidden">Ajouter</span>
                </Button>
            }
            createModal={createModal}
            editModal={editModal}
            deleteModal={deleteModal}
            isSubmitting={isSubmitting}
            selectedItem={selectedItem}
            createModalTitle="Créer une année académique"
            createModalDescription="Définissez les dates de la nouvelle année académique."
            createModalContent={
                <AnneeAcademiqueForm
                    {...formProps}
                    onSubmit={onCreateAnnee}
                    onCancel={createModal.close}
                />
            }
            editModalTitle="Modifier l'année académique"
            editModalDescription="Mettez à jour les informations de l'année."
            editModalContent={
                selectedItem && !selectedItem.numero && (
                    <AnneeAcademiqueForm
                        {...formProps}
                        annee={selectedItem}
                        onSubmit={onUpdateAnnee}
                        onCancel={() => { editModal.close(); setSelectedItem(null); }}
                    />
                )
            }
            deleteModalItemName={selectedItem?.annee}
            onDeleteConfirm={onDeleteAnnee}
        >
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher une année..."
                onReset={resetFilters}
            />

            {/* Liste */}
            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                    </div>
                ) : filteredAnnees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <GraduationCap className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium">Aucune année académique</p>
                        <p className="text-xs mt-1">Créez votre première année avec le bouton ci-dessus.</p>
                    </div>
                ) : filteredAnnees.map(annee => (
                    <AnneeCard
                        key={annee.id}
                        annee={annee}
                        onEdit={(a) => { setSelectedItem(a); editModal.open(); }}
                        onDelete={(a) => { setSelectedItem(a); deleteModal.open(); }}
                        onActivate={handleActivateAnnee}
                        onClose={handleCloseAnnee}
                        onAddSemestre={handleAddSemestre}
                        onEditSemestre={handleEditSemestre}
                        onDeleteSemestre={handleDeleteSemestre}
                        onActivateSemestre={handleActivateSemestre}
                    />
                ))}
            </div>

            {/*  Modals semestres  */}
            <ModalWrapper
                isOpen={createSemestreModal.isOpen}
                onClose={() => { createSemestreModal.close(); setSelectedAnneeForSemestre(null); }}
                title="Créer un semestre"
                description={`Définissez les dates du semestre pour ${selectedAnneeForSemestre?.annee ?? ''}.`}
            >
                <SemestreForm
                    {...formProps}
                    anneesOptions={anneesOptions}
                    anneeIdFixed={selectedAnneeForSemestre ? String(selectedAnneeForSemestre.id) : null}
                    onSubmit={onCreateSemestre}
                    onCancel={() => { createSemestreModal.close(); setSelectedAnneeForSemestre(null); }}
                />
            </ModalWrapper>

            <ModalWrapper
                isOpen={editSemestreModal.isOpen}
                onClose={() => { editSemestreModal.close(); setSelectedItem(null); }}
                title="Modifier le semestre"
                description="Mettez à jour les informations du semestre."
            >
                {selectedItem?.numero && (
                    <SemestreForm
                        {...formProps}
                        semestre={selectedItem}
                        anneesOptions={anneesOptions}
                        onSubmit={onUpdateSemestre}
                        onCancel={() => { editSemestreModal.close(); setSelectedItem(null); }}
                    />
                )}
            </ModalWrapper>

            {/* Suppression semestre — utilise DeleteConfirmModal*/}
            <DeleteConfirmModal
                isOpen={deleteSemestreModal.isOpen}
                onClose={() => { deleteSemestreModal.close(); setSelectedItem(null); }}
                onConfirm={onDeleteSemestre}
                loading={isSubmitting}
                title="Supprimer le semestre"
                itemName={selectedItem?.numero_label ?? selectedItem?.numero}
            />

            {/*  Confirmation activation année  */}
            <ConfirmModal
                isOpen={activateAnneeModal.isOpen}
                onClose={() => { activateAnneeModal.close(); setSelectedItem(null); }}
                onConfirm={confirmActivateAnnee}
                loading={isSubmitting}
                title="Activer cette année ?"
                message={
                    anneeActive && anneeActive.id !== selectedItem?.id
                        ? `L'année "${anneeActive.annee}" est actuellement active et sera automatiquement désactivée. Confirmer l'activation de "${selectedItem?.annee}" ?`
                        : `Voulez-vous activer l'année "${selectedItem?.annee}" ?`
                }
                confirmLabel="Activer"
                variant={anneeActive && anneeActive.id !== selectedItem?.id ? 'warning' : 'default'}
            />

            {/*  Confirmation clôture année  */}
            <ConfirmModal
                isOpen={closeAnneeModal.isOpen}
                onClose={() => { closeAnneeModal.close(); setSelectedItem(null); }}
                onConfirm={confirmCloseAnnee}
                loading={isSubmitting}
                title="Clôturer cette année ?"
                message={`Vous êtes sur le point de clôturer l'année "${selectedItem?.annee}". Cette action est irréversible : l'année ne pourra plus être modifiée ni réactivée.`}
                confirmLabel="Clôturer"
                variant="warning"
            />

            {/*  Confirmation activation semestre  */}
            <ConfirmModal
                isOpen={activateSemestreModal.isOpen}
                onClose={() => { activateSemestreModal.close(); setSelectedItem(null); }}
                onConfirm={confirmActivateSemestre}
                loading={isSubmitting}
                title="Activer ce semestre ?"
                message={`Le semestre actuellement actif dans cette année sera désactivé. Voulez-vous activer le ${selectedItem?.numero_label ?? selectedItem?.numero} ?`}
                confirmLabel="Activer"
                variant="warning"
            />
        </ListPageLayout>
    );
}