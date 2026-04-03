'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emploiDuTempsEtudiantAPI } from '@/lib/api/endpoints';

const INITIAL_FILTERS = {
  semestre_id: null,
  niveau_id: 'current',
  jour: null,
};

function toStringId(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

export default function useEmploiDuTempsEtudiant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [payload, setPayload] = useState({
    etudiant: null,
    semestre: null,
    total_cours: 0,
    emplois: [],
  });

  const requestRef = useRef(0);
  const { semestre_id, jour } = filters;

  const fetchEmploiDuTemps = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await emploiDuTempsEtudiantAPI.getAll({
        semestre_id,
        jour,
      });

      if (requestId !== requestRef.current) return;

      setPayload({
        etudiant: response?.etudiant || null,
        semestre: response?.semestre || null,
        total_cours: response?.total_cours || 0,
        emplois: Array.isArray(response?.emplois) ? response.emplois : [],
      });
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Erreur chargement emploi du temps étudiant:', err);
      setError(err);
      setPayload({
        etudiant: null,
        semestre: null,
        total_cours: 0,
        emplois: [],
      });
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [semestre_id, jour]);

  useEffect(() => {
    fetchEmploiDuTemps();
  }, [fetchEmploiDuTemps]);

  const creneaux = useMemo(() => {
    const niveauNom = payload?.etudiant?.niveau;
    const filiereNom = payload?.etudiant?.filiere;

    return (payload.emplois || []).map((emploi) => ({
      ...emploi,
      jour: emploi?.jour?.code || emploi?.jour || null,
      type: emploi?.type || emploi?.type_seance || null,
      creneau: emploi?.creneau || null,
      cours: emploi?.cours || null,
      professeur: emploi?.professeur
        ? {
            prenom: emploi.professeur.nom_complet || emploi.professeur.prenom || 'Professeur',
            nom: '',
            nom_complet: emploi.professeur.nom_complet || undefined,
          }
        : null,
      salle: emploi?.salle || null,
      niveau: niveauNom
        ? {
            nom: niveauNom,
            filiere: filiereNom ? { nom: filiereNom } : null,
          }
        : null,
    }));
  }, [payload]);

  const semestresOptions = useMemo(() => {
    if (!payload?.semestre?.id) return [];
    const s = payload.semestre;
    return [
      {
        value: String(s.id),
        label: s.label ? `${s.label}` : `Semestre ${s.numero || ''}`,
      },
    ];
  }, [payload.semestre]);

  const niveauxOptions = useMemo(() => {
    if (!payload?.etudiant?.niveau) return [];
    const filiere = payload?.etudiant?.filiere;
    const label = filiere ? `${payload.etudiant.niveau} — ${filiere}` : payload.etudiant.niveau;
    return [{ value: 'current', label }];
  }, [payload.etudiant]);

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
    niveauxOptions,
    filieresOptions: [],
    coursOptions: [],
    updateFilter,
    resetFilters,
    refetch: fetchEmploiDuTemps,
  };
}
