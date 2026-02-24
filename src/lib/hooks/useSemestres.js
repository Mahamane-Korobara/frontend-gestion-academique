'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { semestresAPI, anneesAcademiquesAPI } from '@/lib/api/endpoints';

const hasMessage = (err, matcher) => {
    const raw = err?.data?.message || err?.message || '';
    return matcher.test(String(raw).toLowerCase());
};

const isNoActiveAnneeError = (err) =>
    hasMessage(err, /aucune annee academique active|aucune année académique active/);

const isNoActiveSemestreError = (err) =>
    hasMessage(err, /aucun semestre actif/);

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
            let annee = null;
            try {
                const anneeRes = await anneesAcademiquesAPI.getActive();
                annee = anneeRes.data || anneeRes;
            } catch (err) {
                if (err?.name === 'AbortError') return;
                if (!isNoActiveAnneeError(err)) throw err;
            }

            if (abortControllerRef.current.signal.aborted) return;

            if (!annee?.id) {
                setAnneeActive(null);
                setSemestres([]);
                setSemestreActif(null);
                initialFetchDone.current = true;
                return;
            }

            setAnneeActive(annee);

            // Récupérer les semestres de cette année + le semestre actif
            const semestresRes = await semestresAPI.getAll({ annee_academique_id: annee.id });

            let activeRes = null;
            try {
                activeRes = await semestresAPI.getActive();
            } catch (err) {
                if (err?.name === 'AbortError') return;
                if (!isNoActiveSemestreError(err)) throw err;
            }

            if (!abortControllerRef.current.signal.aborted) {
                setSemestres(semestresRes.data || []);
                setSemestreActif(activeRes?.data || activeRes || null);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                console.error('Erreur chargement semestres:', err);
                initialFetchDone.current = true;
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
        isInitialized: initialFetchDone.current,
        refetch: fetchSemestres,
    };
};

export default useSemestres;
