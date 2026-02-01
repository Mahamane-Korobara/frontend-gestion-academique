'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { annoncesService } from '@/lib/services/annonces.service';

export const useAnnonces = () => {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
        from: 1,
        to: 0,
    });

    const [filters, setFilters] = useState({
        search: '',
        type: null,
        priorite: null,
        isActive: null,
    });

    const [links, setLinks] = useState({});

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // Fonction de fetch principale
    const fetchAnnonces = useCallback(async (shouldResetInitialFlag = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await annoncesService.getAll({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                ...filters,
            });

            // Vérifier si la requête n'a pas été annulée
            if (!abortControllerRef.current.signal.aborted) {
                setAnnonces(response.data || []);
                setPagination({
                    currentPage: response.meta?.current_page || 1,
                    perPage: response.meta?.per_page || 15,
                    total: response.meta?.total || 0,
                    lastPage: response.meta?.last_page || 1,
                    from: response.meta?.from || 1,
                    to: response.meta?.to || 0,
                });
                setLinks(response.links || {});

                if (shouldResetInitialFlag) {
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur lors du chargement des annonces:', err);
                setError(err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [pagination.currentPage, pagination.perPage, filters]);

    // Effet initial : charger les données une seule fois
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAnnonces(true);
        }

        // Cleanup : annuler les requêtes en cours
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []); // Intentionnellement vide pour ne déclencher qu'une fois

    // Effet pour les changements de pagination/filtres (après l'initialisation)
    useEffect(() => {
        if (initialFetchDone.current) {
            fetchAnnonces();
        }
    }, [pagination.currentPage, filters, fetchAnnonces]);

    // Mettre à jour la pagination
    const updatePagination = useCallback((page) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page,
        }));
    }, []);

    // Appliquer les filtres
    const applyFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        setPagination((prev) => ({
            ...prev,
            currentPage: 1, // Reset à la première page
        }));
    }, []);

    // Refetch manuel
    const refetch = useCallback(() => {
        fetchAnnonces();
    }, [fetchAnnonces]);

    // ============ OPÉRATIONS CRUD ============

    /**
     * Créer une nouvelle annonce
     */
    const createAnnonce = useCallback(async (annonceData) => {
        try {
            const response = await annoncesService.create(annonceData);
            // Rafraîchir la liste après création
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la création:', err);
            // Créer une erreur lisible
            const errorObj = new Error(
                err?.message ||
                err?.errors?.toString() ||
                'Une erreur est survenue lors de la création de l\'annonce'
            );
            if (err?.errors) {
                errorObj.validationErrors = err.errors;
            }
            if (err?.status) {
                errorObj.status = err.status;
            }
            throw errorObj;
        }
    }, [refetch]);

    /**
     * Mettre à jour une annonce
     */
    const updateAnnonce = useCallback(async (annonceId, annonceData) => {
        try {
            const response = await annoncesService.update(annonceId, annonceData);

            // Mise à jour optimiste : mettre à jour l'état local immédiatement
            setAnnonces((prevAnnonces) =>
                prevAnnonces.map((annonce) =>
                    annonce.id === annonceId ? { ...annonce, ...response.data } : annonce
                )
            );

            // Rafraîchir la liste pour synchroniser complètement
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la modification:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Supprimer une annonce
     */
    const deleteAnnonce = useCallback(async (annonceId) => {
        try {
            const response = await annoncesService.delete(annonceId);
            // Rafraîchir la liste après suppression
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Activer/Désactiver une annonce
     */
    const toggleActive = useCallback(async (annonceId) => {
        try {
            const response = await annoncesService.toggleActive(annonceId);
            // Rafraîchir la liste après changement de statut
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors du changement de statut:', err);
            throw err;
        }
    }, [refetch]);

    return {
        // État
        annonces,
        pagination,
        links,
        loading,
        error,

        // Actions de base
        refetch,
        applyFilters,
        updatePagination,
        filters,

        // Opérations CRUD
        createAnnonce,
        updateAnnonce,
        deleteAnnonce,
        toggleActive,
    };
};

export default useAnnonces;
