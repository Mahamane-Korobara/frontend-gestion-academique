'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import evaluationsProfesseurService from '@/lib/services/evaluationsProfesseur.service';

export default function useEvaluationsProfesseur(initialParams = {}) {
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
            const res = await evaluationsProfesseurService.getMesEvaluations(paramsRef.current);

            if (!abortRef.current.signal.aborted) {
                setEvaluations(res?.data || []);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
            }
        } finally {
            if (!abortRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) fetchAll();
        return () => abortRef.current?.abort();
    }, [fetchAll]);

    const refetch = useCallback(() => fetchAll(), [fetchAll]);

    const semestresOptions = useMemo(() => {
        const map = new Map();

        (evaluations || []).forEach((ev) => {
            const semestre = ev?.semestre;
            if (!semestre?.id) return;
            const id = String(semestre.id);

            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: semestre.annee
                        ? `${semestre.numero} — ${semestre.annee}`
                        : (semestre.numero || `Semestre ${id}`),
                });
            }
        });

        return Array.from(map.values());
    }, [evaluations]);

    const coursOptions = useMemo(() => {
        const map = new Map();

        (evaluations || []).forEach((ev) => {
            const cours = ev?.cours;
            if (!cours?.id) return;
            const id = String(cours.id);

            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: cours.code ? `${cours.code} — ${cours.titre}` : (cours.titre || `Cours ${id}`),
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [evaluations]);

    const typeOptions = useMemo(() => {
        const map = new Map();

        (evaluations || []).forEach((ev) => {
            const type = ev?.type_evaluation;
            if (!type?.id) return;
            const id = String(type.id);
            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: type.nom || `Type ${id}`,
                });
            }
        });

        return Array.from(map.values());
    }, [evaluations]);

    const statutOptions = useMemo(() => {
        const set = new Set((evaluations || []).map((ev) => ev?.statut).filter(Boolean));

        return Array.from(set).map((value) => ({
            value,
            label: value === 'planifiee'
                ? 'Planifiée'
                : value === 'en_cours'
                    ? 'En cours'
                    : value === 'terminee'
                        ? 'Terminée'
                        : value === 'annulee'
                            ? 'Annulée'
                            : value,
        }));
    }, [evaluations]);

    const coursById = useMemo(() => {
        const map = new Map();

        (evaluations || []).forEach((ev) => {
            const cours = ev?.cours;
            if (!cours?.id) return;
            map.set(String(cours.id), cours);
        });

        return map;
    }, [evaluations]);

    return {
        evaluations,
        loading,
        error,
        refetch,
        semestresOptions,
        coursOptions,
        typeOptions,
        statutOptions,
        coursById,
    };
}
