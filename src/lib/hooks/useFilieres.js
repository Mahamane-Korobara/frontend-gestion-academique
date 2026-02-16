'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { filieresService } from '@/lib/services/filieres.service';

export const useFilieres = () => {
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchFilieres = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);
            const response = await filieresService.getAll();

            if (!abortControllerRef.current.signal.aborted) {
                // On s'assure de récupérer data qui vient de NiveauResource::collection
                setFilieres(response.data || []);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') setError(err);
        } finally {
            if (!abortControllerRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) fetchFilieres();
        return () => abortControllerRef.current?.abort();
    }, [fetchFilieres]);

    const refetch = useCallback(() => fetchFilieres(), [fetchFilieres]);

    // ============ OPÉRATIONS CRUD ============

    const createFiliere = useCallback(async (data) => {
        const response = await filieresService.create(data);
        await refetch();
        return response;
    }, [refetch]);

    const updateFiliere = useCallback(async (id, data) => {
        const response = await filieresService.update(id, data);
        await refetch();
        return response;
    }, [refetch]);

    const deleteFiliere = useCallback(async (id) => {
        const response = await filieresService.delete(id);
        await refetch();
        return response;
    }, [refetch]);

    /**
     * @param {number} filiereId 
     * @param {string} type - 'licence' | 'master' (Attendu par  NiveauController)
     */
    const createStandardLevels = useCallback(async (filiereId, type = 'licence') => {
        try {
            //  endpoint est : /admin/filieres/{id}/create-standard-levels
            const response = await filieresService.createStandardLevels(filiereId, { type });
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur génération niveaux:', err);
            throw err;
        }
    }, [refetch]);

    // ============ HELPERS ============

    const activeFilieres = filieres.filter(f => f.is_active);

    // IMPORTANT : On utilise l'ID pour la value car CreateNiveauRequest attend filiere_id
    const activeFilieresOptions = activeFilieres.map(f => ({
        value: String(f.id), // L'ID pour le backend
        label: f.nom,        // Le nom pour l'UI
        code: f.code,        // Pour affichage badge
        id: f.id
    }));

    return {
        filieres,
        activeFilieres,
        loading,
        error,
        activeFilieresOptions,
        refetch,
        createFiliere,
        updateFiliere,
        deleteFiliere,
        createStandardLevels,
    };
};

export default useFilieres;