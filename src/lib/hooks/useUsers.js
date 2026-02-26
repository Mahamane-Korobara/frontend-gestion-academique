'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usersService } from '@/lib/services/users.service';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [counts, setCounts] = useState({ etudiant: 0, professeur: 0 });
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
                setCounts(response.meta?.counts || { etudiant: 0, professeur: 0 });
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

    // ============ OPÉRATIONS CRUD ============

    /**
     * Créer un nouvel utilisateur
     */
    const createUser = useCallback(async (userData) => {
        try {
            const response = await usersService.create(userData);
            // Rafraîchir la liste après création
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur création:', err.message, {
                status: err.status,
                errors: err.errors,
                data: err.data,
            });
            throw err;
        }
    }, [refetch]);

    /**
     * Mettre à jour un utilisateur
     */
    const updateUser = useCallback(async (userId, userData) => {
        try {
            const response = await usersService.update(userId, userData);
            // Rafraîchir la liste après modification
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la modification:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Supprimer un utilisateur
     */
    const deleteUser = useCallback(async (userId) => {
        try {
            const response = await usersService.delete(userId);
            // Rafraîchir la liste après suppression
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Réinitialiser le mot de passe d'un utilisateur
     */
    const resetPassword = useCallback(async (userId) => {
        try {
            const response = await usersService.resetPassword(userId);
            return response;
        } catch (err) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', err);
            throw err;
        }
    }, []);

    /**
     * Activer/Désactiver un utilisateur
     */
    const toggleActive = useCallback(async (userId) => {
        try {
            const response = await usersService.toggleActive(userId);
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
        users,
        counts,
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
        createUser,
        updateUser,
        deleteUser,
        resetPassword,
        toggleActive,
    };
};

export default useUsers;
