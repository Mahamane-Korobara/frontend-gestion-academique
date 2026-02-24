'use client';

import { useState, useMemo, useEffect } from 'react';

import useModal              from '@/lib/hooks/useModal';
import ListPageLayout        from '@/components/partage/ListPageLayout';
import ListPageFilters       from '@/components/partage/ListPageFilters';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

import useNiveaux    from '@/lib/hooks/useNiveaux';
import useSemestres  from '@/lib/hooks/useSemestres';
import useFilieres   from '@/lib/hooks/useFilieres';
import useCours      from '@/lib/hooks/useCours';

// Hook et service extraits
import useEmploiDuTemps from '@/lib/hooks/useEmploiDuTemps';

import CreneauForm       from '@/components/calendrier/CreneauForm';
import CalendrierSection from '@/components/calendrier/CalendrierSection';

export default function EmploiDuTempsPage() {
    const [activeTab, setActiveTab]       = useState('creation');
    const [createKey, setCreateKey]       = useState(0);
    const [selectedCreneau, setSelectedCreneau] = useState(null);

    const deleteModal = useModal();

    // Tout l'état emploi du temps vient du hook
    const {
        creneaux,
        loading: creneauxLoading,
        filters,
        updateFilter,
        resetFilters,
        createCreneau,
        deleteCreneau,
    } = useEmploiDuTemps();

    // Data Hooks
    const { niveaux, niveauxOptions }                      = useNiveaux();
    const { semestresOptions, semestreActif, anneeActive } = useSemestres();
    const { activeFilieresOptions }                        = useFilieres();
    const { cours }                                        = useCours();

    const niveauxOptionsWithFiliere = useMemo(() => {
        const niveauxById = new Map(
            (niveaux || []).map((niveau) => [String(niveau.id), niveau])
        );

        return (niveauxOptions || []).map((option) => {
            const optionId = String(option.value ?? option.id);
            const niveau = niveauxById.get(optionId);
            const niveauNom = niveau?.nom || option.label || `Niveau ${optionId}`;
            const filiereNom = niveau?.filiere?.nom;

            return {
                ...option,
                label: filiereNom ? `${niveauNom} — ${filiereNom}` : niveauNom,
            };
        });
    }, [niveaux, niveauxOptions]);

    const { isSubmitting, validationErrors, handleCreate, handleDelete } = useModalOperations();

    useEffect(() => {
        if (!semestreActif?.id || filters.semestre_id) return;
        updateFilter('semestre_id', String(semestreActif.id));
    }, [semestreActif?.id, filters.semestre_id, updateFilter]);

    // Options pour le filtre "Cours" dans le calendrier
    const coursOptions = useMemo(() =>
        cours.map(c => ({ value: String(c.id), label: c.titre })),
    [cours]);

    const onCreateCreneau = (data) =>
        handleCreate(
            createCreneau,
            data,
            {
                close: () => {
                    setCreateKey(k => k + 1);
                    setActiveTab('calendrier');
                },
            },
            'Créneau créé avec succès'
        );

    const handleDeleteClick = (id) => {
        const creneau = creneaux.find(c => c.id === id);
        setSelectedCreneau(creneau || { id });
        deleteModal.open();
    };

    const onConfirmDelete = () =>
        handleDelete(
            deleteCreneau,
            selectedCreneau.id,
            deleteModal,
            'Créneau supprimé avec succès',
            () => setSelectedCreneau(null)
        );

    const creneauDeleteName = selectedCreneau?.cours?.titre
        ? `${selectedCreneau.cours.titre} (${selectedCreneau.jour})`
        : 'ce créneau';

    const tabs = [
        { id: 'creation',   label: 'Créer un créneau' },
        { id: 'calendrier', label: 'Calendrier', count: creneaux.length },
    ];

    return (
        <ListPageLayout
            title="Emploi du temps"
            description="Gérez les horaires de cours par filière, niveau et semestre."
            deleteModal={deleteModal}
            isSubmitting={isSubmitting}
            selectedItem={selectedCreneau}
            deleteModalItemName={creneauDeleteName}
            onDeleteConfirm={onConfirmDelete}
        >
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hideSearch={true}
                showResetButton={true}
                onReset={resetFilters}
            />

            {/* VUE : FORMULAIRE DE CRÉATION */}
            {activeTab === 'creation' && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-gray-800">Planifier une séance</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Sélectionnez un cours — les informations associées s'afficheront automatiquement.
                        </p>
                    </div>
                    <CreneauForm
                        key={createKey}
                        serverErrors={validationErrors}
                        loading={isSubmitting}
                        anneeActive={anneeActive}
                        onSubmit={onCreateCreneau}
                    />
                </div>
            )}

            {/* VUE : CALENDRIER INTERACTIF */}
            {activeTab === 'calendrier' && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <CalendrierSection
                        creneaux={creneaux}
                        loading={creneauxLoading}
                        niveauxOptions={niveauxOptionsWithFiliere}
                        semestresOptions={semestresOptions}
                        filieresOptions={activeFilieresOptions}
                        coursOptions={coursOptions}
                        filters={filters}
                        onFiltreFiliere={(v) => updateFilter('filiere_id',  v)}
                        onFiltreNiveau={(v)   => updateFilter('niveau_id',   v)}
                        onFiltreSemestre={(v) => updateFilter('semestre_id', v)}
                        onFiltreCours={(v)    => updateFilter('cours_id',    v)}
                        onDelete={handleDeleteClick}
                    />
                </div>
            )}
        </ListPageLayout>
    );
}
