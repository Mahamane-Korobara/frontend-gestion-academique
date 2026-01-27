'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { filieresService } from '@/lib/services/filieres.service';

export const useFilieres = () => {
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // Fonction de fetch principale
    const fetchFilieres = useCallback(async (shouldResetInitialFlag = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await filieresService.getAll();

            // Vérifier si la requête n'a pas été annulée
            if (!abortControllerRef.current.signal.aborted) {
                setFilieres(response.data || []);

                if (shouldResetInitialFlag) {
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur lors du chargement des filières:', err);
                setError(err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    // Effet initial : charger les données une seule fois
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchFilieres(true);
        }

        // Cleanup : annuler les requêtes en cours
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []); // Intentionnellement vide pour ne déclencher qu'une fois

    // Refetch manuel
    const refetch = useCallback(() => {
        fetchFilieres();
    }, [fetchFilieres]);

    // ============ OPÉRATIONS CRUD ============

    /**
     * Créer une nouvelle filière
     */
    const createFiliere = useCallback(async (filiereData) => {
        try {
            const response = await filieresService.create(filiereData);
            // Rafraîchir la liste après création
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la création:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Mettre à jour une filière
     */
    const updateFiliere = useCallback(async (filiereId, filiereData) => {
        try {
            const response = await filieresService.update(filiereId, filiereData);
            // Rafraîchir la liste après modification
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la modification:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Supprimer une filière
     */
    const deleteFiliere = useCallback(async (filiereId) => {
        try {
            const response = await filieresService.delete(filiereId);
            // Rafraîchir la liste après suppression
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Créer les niveaux standards pour une filière
     */
    const createStandardLevels = useCallback(async (filiereId) => {
        try {
            const response = await filieresService.createStandardLevels(filiereId);
            // Rafraîchir la liste après création des niveaux
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la création des niveaux standards:', err);
            throw err;
        }
    }, [refetch]);

    // ============ HELPERS ============

    /**
     * Récupérer uniquement les filières actives
     */
    const activeFilieres = filieres.filter(f => f.is_active);

    /**
     * Récupérer les options pour un select
     */
    const filieresOptions = filieres.map(f => ({
        value: f.code.toLowerCase(),
        label: f.nom,
        code: f.code,
        id: f.id
    }));

    /**
     * Récupérer les options des filières actives seulement
     */
    const activeFilieresOptions = activeFilieres.map(f => ({
        value: f.code.toLowerCase(),
        label: f.nom,
        code: f.code,
        id: f.id
    }));

    return {
        // État
        filieres,
        activeFilieres,
        loading,
        error,

        // Options pour les selects
        filieresOptions,
        activeFilieresOptions,

        // Actions de base
        refetch,

        // Opérations CRUD
        createFiliere,
        updateFiliere,
        deleteFiliere,
        createStandardLevels,
    };
};

export default useFilieres;