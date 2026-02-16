'use client';

import { useState } from 'react';

import useModal from '@/lib/hooks/useModal';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

import useCours from '@/lib/hooks/useCours';
import useNiveaux from '@/lib/hooks/useNiveaux';
import useSemestres from '@/lib/hooks/useSemestres';
import useProfesseurs from '@/lib/hooks/useProfesseurs';

import CoursSection       from '@/components/cours/CoursSection';
import AffectationSection from '@/components/cours/AffectationSection';
import CoursForm          from '@/components/forms/CoursForm';
import AffectationForm    from '@/components/forms/AffectationForm';

export default function CoursPage() {
    const [activeTab, setActiveTab]         = useState('cours');
    const [searchQuery, setSearchQuery]     = useState('');
    const [selectedCours, setSelectedCours] = useState(null);
    const [coursAffecter, setCoursAffecter] = useState(null);
    const [createKey, setCreateKey]         = useState(0);

    const editModal        = useModal();
    const deleteModal      = useModal();
    const affectationModal = useModal();

    const {
        cours,
        loading: coursLoading,
        createCours,
        updateCours,
        deleteCours,
        affecterProfesseurs,
    } = useCours();

    const { niveauxOptions }                                      = useNiveaux();
    const { semestresOptions, semestreActif, anneeActive }        = useSemestres();
    const { professeursOptions }                                  = useProfesseurs();

    const {
        isSubmitting,
        validationErrors,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSimpleOperation,
    } = useModalOperations();

    // Helpers
    const buildPayload = (data) => {
        const anneeId = semestreActif?.annee_academique?.id || anneeActive?.id;
        return anneeId ? { ...data, annee_academique_id: anneeId } : data;
    };

    //  Handlers
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    const handleEdit = (c) => {
        setSelectedCours(c);
        editModal.open();
    };

    const handleDeleteClick = (c) => {
        setSelectedCours(c);
        deleteModal.open();
    };

    const handleAffecter = (c) => {
        setCoursAffecter(c);
        affectationModal.open();
    };

    const handleRetirer = (c) =>
        handleSimpleOperation(
            () => affecterProfesseurs(c.id, { professeur_ids: [] }),
            'Professeur retiré avec succès',
            'Erreur lors du retrait'
        );

    //  CRUD
    const onCreateCours = (data) => {
        const fakeModal = { close: () => setCreateKey(k => k + 1) };
        return handleCreate(
            createCours,
            buildPayload(data),
            fakeModal,
            'Cours créé avec succès'
        );
    };

    const onUpdateCours = (data) =>
        handleUpdate(
            updateCours,
            selectedCours.id,
            buildPayload(data),
            editModal,
            'Cours modifié avec succès',
            () => setSelectedCours(null)
        );

    const onDeleteCours = () =>
        handleDelete(
            deleteCours,
            selectedCours.id,
            deleteModal,
            'Cours supprimé avec succès',
            () => setSelectedCours(null)
        );

    const onAffecterProfesseur = async (data) => {
        const result = await handleSimpleOperation(
            () => affecterProfesseurs(coursAffecter.id, data),
            'Professeur affecté avec succès',
            "Erreur lors de l'affectation"
        );
        if (result.success) {
            affectationModal.close();
            setCoursAffecter(null);
        }
    };

    //  Props formulaires 
    const formCommonProps = {
        serverErrors:      validationErrors,
        loading:           isSubmitting,
        niveauxOptions,
        semestresOptions,
        professeursOptions,
        semestreActif,
    };

    const tabs = [
        { id: 'cours',        label: 'Cours',        count: cours.length },
        { id: 'affectations', label: 'Affectations' },
    ];

    return (
        <>
            <ListPageLayout
                title="Gestion des cours"
                description="Gérez les cours et les affectations professeurs."
                editModal={editModal}
                deleteModal={deleteModal}
                isSubmitting={isSubmitting}
                selectedItem={selectedCours}
                editModalTitle="Modifier le cours"
                editModalDescription="Mettez à jour les informations du cours."
                editModalContent={
                    selectedCours && (
                        <CoursForm
                            {...formCommonProps}
                            cours={selectedCours}
                            onSubmit={onUpdateCours}
                            onCancel={() => {
                                editModal.close();
                                setSelectedCours(null);
                            }}
                        />
                    )
                }
                deleteModalItemName={selectedCours?.titre}
                onDeleteConfirm={onDeleteCours}
            >
                {/* ── Formulaire création — toujours visible ── */}
                {activeTab === 'cours' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm mb-6">
                        <div className="mb-5">
                            <h2 className="text-base font-bold text-gray-800">Nouveau cours</h2>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Remplissez les informations ci-dessous pour créer un cours.
                            </p>
                        </div>
                        <CoursForm
                            key={createKey}
                            {...formCommonProps}
                            onSubmit={onCreateCours}
                            hideCancel
                        />
                    </div>
                )}

                <ListPageFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder={
                        activeTab === 'cours'
                            ? 'Titre, code ou niveau...'
                            : 'Cours ou professeur...'
                    }
                    onReset={() => setSearchQuery('')}
                />

                <div className="mt-4">
                    {activeTab === 'cours' && (
                        <CoursSection
                            cours={cours}
                            loading={coursLoading}
                            searchQuery={searchQuery}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onAffecter={handleAffecter}
                        />
                    )}

                    {activeTab === 'affectations' && (
                        <AffectationSection
                            cours={cours}
                            loading={coursLoading}
                            searchQuery={searchQuery}
                            onReaffecter={handleAffecter}
                            onRetirer={handleRetirer}
                        />
                    )}
                </div>
            </ListPageLayout>

            {/* Modal affectation responsive */}
            {affectationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">
                            Affecter un professeur
                        </h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Assignez un professeur responsable à ce cours.
                        </p>
                        <AffectationForm
                            cours={coursAffecter}
                            professeursOptions={professeursOptions}
                            serverErrors={validationErrors}
                            loading={isSubmitting}
                            onSubmit={onAffecterProfesseur}
                            onCancel={() => {
                                affectationModal.close();
                                setCoursAffecter(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}