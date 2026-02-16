'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { niveauxService } from '@/lib/services/niveaux.service';

export const useNiveaux = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // La fonction de fetch principale (automatisée)
    const fetchAllNiveaux = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const response = await niveauxService.getAll();
            if (!abortControllerRef.current.signal.aborted) {
                setNiveaux(response.data || []);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur chargement niveaux:', err);
                setError(err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllNiveaux();
        }
        return () => abortControllerRef.current?.abort();
    }, [fetchAllNiveaux]);

    // Charger les niveaux d'une filière spécifique (API Filter)
    const fetchByFiliere = useCallback(async (filiereId) => {
        if (!filiereId) return [];
        setLoading(true);
        try {
            const response = await niveauxService.getByFiliere(filiereId);
            return response.data || [];
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // CRUD Operations
    const createNiveau = useCallback(async (data) => {
        const res = await niveauxService.create(data);
        await fetchAllNiveaux(); // Rafraîchit la liste globale
        return res;
    }, [fetchAllNiveaux]);

    const updateNiveau = useCallback(async (id, data) => {
        const res = await niveauxService.update(id, data);
        await fetchAllNiveaux();
        return res;
    }, [fetchAllNiveaux]);

    const deleteNiveau = useCallback(async (id) => {
        const res = await niveauxService.delete(id);
        await fetchAllNiveaux();
        return res;
    }, [fetchAllNiveaux]);

    // 5. HELPERS pour les Selects
    const niveauxOptions = niveaux.map(n => ({
        value: String(n.id),
        label: n.nom || `Niveau ${n.id}`,
        id: n.id,
        filiere_id: n.filiere_id
    }));

    const getNiveauxByFiliere = useCallback((filiereId) => {
        if (!filiereId) return [];
        return niveaux
            .filter(n => String(n.filiere_id) === String(filiereId))
            .map(n => ({
                value: String(n.id),
                label: n.nom || `Niveau ${n.id}`,
                id: n.id
            }));
    }, [niveaux]);

    return {
        niveaux,
        loading,
        error,
        fetchAllNiveaux,
        refetch: fetchAllNiveaux,
        fetchByFiliere,
        createNiveau,
        updateNiveau,
        deleteNiveau,
        niveauxOptions,
        getNiveauxByFiliere,
    };
};

export default useNiveaux;