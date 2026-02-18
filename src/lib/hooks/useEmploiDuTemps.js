import { useState, useCallback, useEffect, useRef } from 'react';
import emploiDuTempsService from '@/lib/services/emploiDuTemps.service';

const INITIAL_FILTERS = {
    niveau_id: null,
    semestre_id: null,
    filiere_id: null,
    cours_id: null,
};

/**
 * Hook emploi du temps — gère la liste, les filtres, et les actions CRUD
 */
export default function useEmploiDuTemps() {
    const [creneaux, setCreneaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const abortRef = useRef(null);

    const fetchCreneaux = useCallback(async () => {
        // Annuler la requête précédente si elle est encore en cours
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const data = await emploiDuTempsService.fetchAll(
                filters,
                abortRef.current.signal
            );

            if (!abortRef.current.signal.aborted) {
                setCreneaux(data);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur emploi du temps:', err);
                setError('Impossible de charger les créneaux.');
            }
        } finally {
            if (!abortRef.current?.signal.aborted) setLoading(false);
        }
    }, [filters.niveau_id, filters.semestre_id, filters.filiere_id, filters.cours_id]);

    useEffect(() => {
        fetchCreneaux();
        return () => abortRef.current?.abort();
    }, [fetchCreneaux]);

    const createCreneau = useCallback(async (data) => {
        const res = await emploiDuTempsService.create(data);
        await fetchCreneaux();
        return res;
    }, [fetchCreneaux]);

    const deleteCreneau = useCallback(async (id) => {
        const res = await emploiDuTempsService.delete(id);
        await fetchCreneaux();
        return res;
    }, [fetchCreneaux]);

    const updateFilter = useCallback((key, value) => {
        setFilters(f => ({ ...f, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    return {
        // État
        creneaux,
        loading,
        error,
        filters,

        // Setters filtres
        setFilters,
        updateFilter,
        resetFilters,

        // Actions
        createCreneau,
        deleteCreneau,
        refetch: fetchCreneaux,
    };
}