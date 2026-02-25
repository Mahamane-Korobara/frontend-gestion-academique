'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import evaluationsService from '@/lib/services/evaluations.service';

export default function useEvaluations(initialParams = {}) {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortRef = useRef(null);
    const initialFetchDone = useRef(false);
    const paramsRef = useRef(initialParams);

    const fetchAll = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
            const res = await evaluationsService.getAll(paramsRef.current);
            if (!abortRef.current.signal.aborted) {
                setEvaluations(res?.data || []);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') setError(err);
        } finally {
            if (!abortRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) fetchAll();
        return () => abortRef.current?.abort();
    }, [fetchAll]);

    const refetch = useCallback(() => fetchAll(), [fetchAll]);

    const createEvaluation = useCallback(async (coursId, data) => {
        const res = await evaluationsService.create(coursId, data);
        await refetch();
        return res;
    }, [refetch]);

    const updateEvaluation = useCallback(async (id, data) => {
        const res = await evaluationsService.update(id, data);
        await refetch();
        return res;
    }, [refetch]);

    const deleteEvaluation = useCallback(async (id) => {
        const res = await evaluationsService.delete(id);
        await refetch();
        return res;
    }, [refetch]);

    //  Helpers 
    // Options statut pour les filtres/form
    const statutOptions = [
        { value: 'planifiee', label: 'Planifiée' },
        { value: 'en_cours', label: 'En cours' },
        { value: 'terminee', label: 'Terminée' },
        { value: 'annulee', label: 'Annulée' },
    ];

    return {
        evaluations,
        loading,
        error,
        refetch,
        createEvaluation,
        updateEvaluation,
        deleteEvaluation,
        statutOptions,
    };
}
// NOTE : Les types d'évaluation sont gérés de façon statique dans EvaluationsPage
// car il n'y a pas d'endpoint /admin/types-evaluations dans l'API exposée.
// Si un tel endpoint est créé plus tard, créer un useTypesEvaluations() dédié.
