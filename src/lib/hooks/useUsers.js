'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usersService } from '@/lib/services/users.service';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
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
        role: null,
        isActive: null,
    });

    const [links, setLinks] = useState({});

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // Fonction de fetch principale
    const fetchUsers = useCallback(async (shouldResetInitialFlag = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await usersService.getAll({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                ...filters,
            });

            // Vérifier si la requête n'a pas été annulée
            if (!abortControllerRef.current.signal.aborted) {
                setUsers(response.data || []);
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
                console.error('Erreur lors du chargement des utilisateurs:', err);
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
            fetchUsers(true);
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
            fetchUsers();
        }
    }, [pagination.currentPage, filters, fetchUsers]);

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
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        pagination,
        links,
        loading,
        error,
        refetch,
        applyFilters,
        updatePagination,
        filters,
    };
};

export default useUsers;