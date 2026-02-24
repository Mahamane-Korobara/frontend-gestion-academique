'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import emploiDuTempsProfesseurService from '@/lib/services/emploiDuTempsProfesseur.service';

const INITIAL_FILTERS = {
    semestre_id: null,
    niveau_id: null,
    filiere_id: null,
    cours_id: null,
    jour: null,
};

function toStringId(value) {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
}

export default function useEmploiDuTempsProfesseur() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [payload, setPayload] = useState({
        filtres_appliques: INITIAL_FILTERS,
        total_cours: 0,
        semestres: [],
    });

    const requestIdRef = useRef(0);
    const { semestre_id, niveau_id, filiere_id, cours_id, jour } = filters;

    const fetchEmploiDuTemps = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        const activeFilters = { semestre_id, niveau_id, filiere_id, cours_id, jour };

        setLoading(true);
        setError(null);

        try {
            const response = await emploiDuTempsProfesseurService.fetchAll(activeFilters);

            if (requestId !== requestIdRef.current) return;

            setPayload({
                filtres_appliques: response?.filtres_appliques || INITIAL_FILTERS,
                total_cours: response?.total_cours || 0,
                semestres: Array.isArray(response?.semestres) ? response.semestres : [],
            });
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error('Erreur chargement emploi du temps professeur:', err);
            setError(err);
            setPayload({
                filtres_appliques: INITIAL_FILTERS,
                total_cours: 0,
                semestres: [],
            });
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [semestre_id, niveau_id, filiere_id, cours_id, jour]);

    useEffect(() => {
        fetchEmploiDuTemps();
    }, [fetchEmploiDuTemps]);

    const creneaux = useMemo(() => {
        return (payload.semestres || []).flatMap((bloc) => {
            const semestreMeta = bloc?.semestre || null;
            const emplois = Array.isArray(bloc?.emplois) ? bloc.emplois : [];

            return emplois.map((emploi) => ({
                ...emploi,
                semestre: emploi?.semestre || semestreMeta,
            }));
        });
    }, [payload.semestres]);

    const semestresOptions = useMemo(() => {
        const map = new Map();

        (payload.semestres || []).forEach((bloc) => {
            const s = bloc?.semestre;
            if (!s?.id) return;
            const id = String(s.id);

            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: s.annee ? `${s.label} - ${s.annee}` : (s.label || `Semestre ${s.numero || ''}`),
                });
            }
        });

        return Array.from(map.values());
    }, [payload.semestres]);

    const filieresOptions = useMemo(() => {
        const map = new Map();

        creneaux.forEach((emploi) => {
            const filiere = emploi?.niveau?.filiere;
            if (!filiere?.id) return;
            const id = String(filiere.id);
            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: filiere.nom || `Filiere ${id}`,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [creneaux]);

    const niveauxOptions = useMemo(() => {
        const map = new Map();

        creneaux.forEach((emploi) => {
            const niveau = emploi?.niveau;
            if (!niveau?.id) return;

            const id = String(niveau.id);
            const filiereNom = niveau?.filiere?.nom;
            const niveauNom = niveau.nom || `Niveau ${id}`;

            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: filiereNom ? `${niveauNom} — ${filiereNom}` : niveauNom,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [creneaux]);

    const coursOptions = useMemo(() => {
        const map = new Map();

        creneaux.forEach((emploi) => {
            const cours = emploi?.cours;
            if (!cours?.id) return;
            const id = String(cours.id);

            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: cours.code ? `${cours.titre} (${cours.code})` : (cours.titre || `Cours ${id}`),
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [creneaux]);

    const updateFilter = useCallback((key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: toStringId(value),
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    return {
        creneaux,
        loading,
        error,
        filters,
        totalCours: payload.total_cours || 0,
        semestresOptions,
        filieresOptions,
        niveauxOptions,
        coursOptions,
        updateFilter,
        resetFilters,
        refetch: fetchEmploiDuTemps,
    };
}
