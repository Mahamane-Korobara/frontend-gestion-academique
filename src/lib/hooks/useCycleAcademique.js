'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import cycleAcademiqueService from '@/lib/services/cycleAcademique.service';

export default function useCycleAcademique() {
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchAnnees = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
            const res = await cycleAcademiqueService.getAllAnnees();
            if (!abortRef.current.signal.aborted) {
                setAnnees(res?.data || []);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                initialFetchDone.current = true;
            }
        } finally {
            if (!abortRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) fetchAnnees();
        return () => abortRef.current?.abort();
    }, [fetchAnnees]);

    const refetch = useCallback(() => fetchAnnees(), [fetchAnnees]);

    // ── Années académiques ────────────────────────────────────────────────────
    const createAnnee = useCallback(async (data) => {
        const res = await cycleAcademiqueService.createAnnee(data);
        await refetch();
        return res;
    }, [refetch]);

    const updateAnnee = useCallback(async (id, data) => {
        const res = await cycleAcademiqueService.updateAnnee(id, data);
        await refetch();
        return res;
    }, [refetch]);

    const deleteAnnee = useCallback(async (id) => {
        const res = await cycleAcademiqueService.deleteAnnee(id);
        await refetch();
        return res;
    }, [refetch]);

    const activateAnnee = useCallback(async (id) => {
        const res = await cycleAcademiqueService.activateAnnee(id);
        await refetch();
        return res;
    }, [refetch]);

    const closeAnnee = useCallback(async (id) => {
        const res = await cycleAcademiqueService.closeAnnee(id);
        await refetch();
        return res;
    }, [refetch]);

    // ── Semestres ─────────────────────────────────────────────────────────────
    const createSemestre = useCallback(async (data) => {
        const res = await cycleAcademiqueService.createSemestre(data);
        await refetch();
        return res;
    }, [refetch]);

    const updateSemestre = useCallback(async (id, data) => {
        const res = await cycleAcademiqueService.updateSemestre(id, data);
        await refetch();
        return res;
    }, [refetch]);

    const deleteSemestre = useCallback(async (id) => {
        const res = await cycleAcademiqueService.deleteSemestre(id);
        await refetch();
        return res;
    }, [refetch]);

    const activateSemestre = useCallback(async (id) => {
        const res = await cycleAcademiqueService.activateSemestre(id);
        await refetch();
        return res;
    }, [refetch]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const anneeActive = annees.find(a => a.is_active) ?? null;

    const anneesOptions = annees.map(a => ({
        value: String(a.id),
        label: a.annee,
    }));

    return {
        annees,
        anneeActive,
        anneesOptions,
        loading,
        error,
        isInitialized: initialFetchDone.current,
        refetch,
        createAnnee,
        updateAnnee,
        deleteAnnee,
        activateAnnee,
        closeAnnee,
        createSemestre,
        updateSemestre,
        deleteSemestre,
        activateSemestre,
    };
}
