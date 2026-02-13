'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { niveauxService } from '@/lib/services/niveaux.service';

export const useNiveaux = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchNiveaux = useCallback(async (shouldResetInitialFlag = false) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await niveauxService.getAll();

            if (!abortControllerRef.current.signal.aborted) {
                setNiveaux(response.data || []);
                if (shouldResetInitialFlag) {
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur lors du chargement des niveaux:', err);
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
            fetchNiveaux(true);
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const refetch = useCallback(() => fetchNiveaux(), [fetchNiveaux]);

    // ── Helpers ─────────────────────────────────────────────────────────────────

    /**
     * Options pour <FormSelect> — valeur = ID réel de la BDD
     * Format : [{ value: "3", label: "L1" }, ...]
     */
    const niveauxOptions = niveaux.map(n => ({
        value: String(n.id),
        label: n.nom ?? n.name ?? n.label ?? `Niveau ${n.id}`,
        id: n.id,
    }));

    /**
     * Options filtrées par filière
     */
    const getNiveauxByFiliere = useCallback(
        (filiereId) =>
            niveaux
                .filter(n => n.filiere_id === Number(filiereId))
                .map(n => ({
                    value: String(n.id),
                    label: n.nom ?? n.name ?? n.label ?? `Niveau ${n.id}`,
                    id: n.id,
                })),
        [niveaux]
    );

    return {
        niveaux,
        loading,
        error,
        refetch,
        niveauxOptions,
        getNiveauxByFiliere,
    };
};

export default useNiveaux;