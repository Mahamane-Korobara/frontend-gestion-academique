'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import useModal            from '@/lib/hooks/useModal';
import ListPageLayout      from '@/components/partage/ListPageLayout';
import ListPageFilters     from '@/components/partage/ListPageFilters';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

import useNiveaux     from '@/lib/hooks/useNiveaux';
import useSemestres   from '@/lib/hooks/useSemestres';
import useProfesseurs from '@/lib/hooks/useProfesseurs';
import useFilieres    from '@/lib/hooks/useFilieres';
import useCours       from '@/lib/hooks/useCours';

import { emploiDuTempsAdminAPI } from '@/lib/api/endpoints';

import CreneauForm       from '@/components/calendrier/CreneauForm';
import CalendrierSection from '@/components/calendrier/CalendrierSection';

// ─── Hook local ────────────────────────────────────────────────────────────────
function useEmploiDuTemps() {
    const [creneaux, setCreneaux] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [filters, setFilters]   = useState({
        niveau_id:   null,
        semestre_id: null,
        filiere_id:  null, // ✅ filière (filtre local, pas envoyé au backend)
        cours_id:    null, // ✅ cours (filtre local, pas envoyé au backend)
    });
    const abortRef = useRef(null);

    const fetchCreneaux = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        try {
            // ✅ FIX : N'envoyer QUE les filtres avec valeur au backend
            // filiere_id et cours_id sont filtrés côté frontend
            const params = {};
            if (filters.niveau_id)   params.niveau_id   = filters.niveau_id;
            if (filters.semestre_id) params.semestre_id = filters.semestre_id;
            // ✅ NE PAS envoyer '' ou null — le backend le rejette pour "Tous"

            const res = await emploiDuTempsAdminAPI.getAll(params);
            if (!abortRef.current.signal.aborted) {
                setCreneaux(res?.data || res || []);
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Erreur emploi du temps:', err);
        } finally {
            if (!abortRef.current?.signal.aborted) setLoading(false);
        }
    }, [filters.niveau_id, filters.semestre_id]); // ✅ Seulement ces 2 déclenchent un fetch

    useEffect(() => {
        fetchCreneaux();
        return () => abortRef.current?.abort();
    }, [fetchCreneaux]);

    const createCreneau = useCallback(async (data) => {
        const res = await emploiDuTempsAdminAPI.create(data);
        await fetchCreneaux();
        return res;
    }, [fetchCreneaux]);

    const deleteCreneau = useCallback(async (id) => {
        const res = await emploiDuTempsAdminAPI.delete(id);
        await fetchCreneaux();
        return res;
    }, [fetchCreneaux]);

    return { creneaux, loading, filters, setFilters, createCreneau, deleteCreneau };
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function EmploiDuTempsPage() {
    const [activeTab, setActiveTab] = useState('creation');
    const [createKey, setCreateKey] = useState(0);

    const [selectedCreneau, setSelectedCreneau] = useState(null);
    const deleteModal = useModal();

    const {
        creneaux, loading: creneauxLoading,
        filters, setFilters,
        createCreneau, deleteCreneau,
    } = useEmploiDuTemps();

    const { niveauxOptions }                               = useNiveaux();
    const { semestresOptions, semestreActif, anneeActive } = useSemestres();
    const { professeursOptions }                           = useProfesseurs();
    const { activeFilieresOptions }                        = useFilieres();
    const { cours }                                        = useCours();

    const { isSubmitting, validationErrors, handleCreate, handleDelete } = useModalOperations();

    // ✅ Options cours pour le filtre calendrier
    const coursOptions = useMemo(() =>
        cours.map(c => ({ value: String(c.id), label: c.titre })),
    [cours]);

    // ✅ Filtrage LOCAL côté frontend (filière + cours)
    // Les filtres niveau/semestre sont envoyés au backend
    const creneauxFiltres = useMemo(() => {
        let result = creneaux;

        // Filtre filière : comparer via le niveau du créneau
        if (filters.filiere_id) {
            result = result.filter(c =>
                String(c.niveau?.filiere_id) === String(filters.filiere_id)
            );
        }

        // Filtre cours
        if (filters.cours_id) {
            result = result.filter(c =>
                String(c.cours_id || c.cours?.id) === String(filters.cours_id)
            );
        }

        return result;
    }, [creneaux, filters.filiere_id, filters.cours_id]);

    // ─── Handlers filtres ──────────────────────────────────────────────────────
    const handleFiltreFiliere  = (v) => setFilters(f => ({ ...f, filiere_id:  v }));
    const handleFiltreNiveau   = (v) => setFilters(f => ({ ...f, niveau_id:   v }));
    // ✅ FIX semestre : null = "Tous" (ne sera pas envoyé au backend)
    const handleFiltreSemestre = (v) => setFilters(f => ({ ...f, semestre_id: v }));
    const handleFiltreCours    = (v) => setFilters(f => ({ ...f, cours_id:    v }));

    // ─── Création ──────────────────────────────────────────────────────────────
    const onCreateCreneau = (data) =>
        handleCreate(
            createCreneau,
            data,
            { close: () => setCreateKey(k => k + 1) },
            'Créneau créé avec succès'
        );

    // ─── Suppression ───────────────────────────────────────────────────────────
    const handleDeleteClick = (id) => {
        const creneau = creneaux.find(c => c.id === id);
        setSelectedCreneau(creneau || { id, cours: null });
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

    const creneauDeleteName = selectedCreneau
        ? selectedCreneau.cours?.titre
            ? `${selectedCreneau.cours.titre} — ${selectedCreneau.jour} ${selectedCreneau.creneau?.debut}–${selectedCreneau.creneau?.fin}`
            : `Créneau #${selectedCreneau.id}`
        : '';

    const tabs = [
        { id: 'creation',   label: 'Créer un créneau' },
        { id: 'calendrier', label: 'Calendrier', count: creneaux.length },
    ];

    return (
        <ListPageLayout
            title="Emploi du temps"
            description="Planifiez les créneaux horaires des cours par niveau et semestre."
            deleteModal={deleteModal}
            isSubmitting={isSubmitting}
            selectedItem={selectedCreneau}
            deleteModalItemName={creneauDeleteName}
            onDeleteConfirm={onConfirmDelete}
        >
            {/* Tabs */}
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hideSearch
                onReset={() => {}}
            />

            {/* Onglet création */}
            {activeTab === 'creation' && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-gray-800">Nouveau créneau</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Assignez un cours, un professeur, un jour et des horaires.
                        </p>
                    </div>
                    <CreneauForm
                        key={createKey}
                        serverErrors={validationErrors}
                        loading={isSubmitting}
                        niveauxOptions={niveauxOptions}
                        semestresOptions={semestresOptions}
                        professeursOptions={professeursOptions}
                        semestreActif={semestreActif}
                        onSubmit={onCreateCreneau}
                    />
                </div>
            )}

            {/* Onglet calendrier */}
            {activeTab === 'calendrier' && (
                <div className="mt-4">
                    <CalendrierSection
                        creneaux={creneauxFiltres}
                        loading={creneauxLoading}
                        niveauxOptions={niveauxOptions}
                        semestresOptions={semestresOptions}
                        filieresOptions={activeFilieresOptions}
                        coursOptions={coursOptions}
                        filters={filters}
                        onFiltreFiliere={handleFiltreFiliere}
                        onFiltreNiveau={handleFiltreNiveau}
                        onFiltreSemestre={handleFiltreSemestre}
                        onFiltreCours={handleFiltreCours}
                        onDelete={handleDeleteClick}
                    />
                </div>
            )}
        </ListPageLayout>
    );
}