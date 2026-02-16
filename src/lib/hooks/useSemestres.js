'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { semestresAPI, anneesAcademiquesAPI } from '@/lib/api/endpoints';

export const useSemestres = () => {
    const [semestres, setSemestres] = useState([]);
    const [semestreActif, setSemestreActif] = useState(null);
    const [anneeActive, setAnneeActive] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchSemestres = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Récupérer l'année académique active
            const anneeRes = await anneesAcademiquesAPI.getActive();
            const annee = anneeRes.data || anneeRes;

            if (!abortControllerRef.current.signal.aborted && annee?.id) {
                setAnneeActive(annee);

                // Récupérer les semestres de cette année + le semestre actif
                const [semestresRes, activeRes] = await Promise.all([
                    semestresAPI.getAll({ annee_academique_id: annee.id }),
                    semestresAPI.getActive(),
                ]);

                if (!abortControllerRef.current.signal.aborted) {
                    setSemestres(semestresRes.data || []);
                    setSemestreActif(activeRes.data || activeRes || null);
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                console.error('Erreur chargement semestres:', err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) fetchSemestres();
        return () => abortControllerRef.current?.abort();
    }, [fetchSemestres]);

    const semestresOptions = semestres.map(s => ({
        value: String(s.id),
        label: `Semestre ${s.numero}${s.annee_academique?.annee ? ` — ${s.annee_academique.annee}` : ''}`,
        id: s.id,
        numero: s.numero,
        is_active: s.is_active,
        annee_academique_id: s.annee_academique_id,
    }));

    return {
        semestres,
        semestreActif,
        anneeActive,
        semestresOptions,
        loading,
        error,
        refetch: fetchSemestres,
    };
};

export default useSemestres;