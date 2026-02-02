'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { annoncesService } from '@/lib/services/annonces.service';
import useAuth from '@/lib/hooks/useAuth';

export const useAnnonces = () => {
    const { user } = useAuth();
    // On attend que l'user soit chargé pour définir le rôle réel
    const userRole = user?.role?.name || null;

    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
    });

    const [filters, setFilters] = useState({
        search: '',
        type: null,
        priorite: null,
        isActive: null,
    });

    const abortControllerRef = useRef(null);

    const fetchAnnonces = useCallback(async () => {
        // IMPORTANT : Ne pas lancer l'appel si l'utilisateur n'est pas encore identifié
        if (!userRole) return;

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await annoncesService.getAll(userRole, {
                page: pagination.currentPage,
                per_page: pagination.perPage,
                ...filters,
            });

            if (!abortControllerRef.current.signal.aborted) {
                // On s'adapte à la structure de données (data.data ou data)
                const data = response.data || response;
                const meta = response.meta || {};

                setAnnonces(Array.isArray(data) ? data : []);
                setPagination(prev => ({
                    ...prev,
                    total: meta.total || 0,
                    lastPage: meta.last_page || 1,
                }));
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                // Extraction du message d'erreur réel pour éviter le "{}"
                const message = err.response?.data?.message || err.message || "Erreur de chargement";
                console.error('Erreur détaillée:', message);
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, [userRole, pagination.currentPage, pagination.perPage, filters]);

    // Déclencheur de chargement
    useEffect(() => {
        fetchAnnonces();
        return () => abortControllerRef.current?.abort();
    }, [fetchAnnonces]);

    // --- Actions CRUD ---

    const createAnnonce = useCallback(async (annonceData) => {
        try {
            const response = await annoncesService.create(userRole, annonceData);
            await fetchAnnonces();
            return response;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Erreur lors de la création";
            throw new Error(msg);
        }
    }, [userRole, fetchAnnonces]);

    const deleteAnnonce = useCallback(async (id) => {
        try {
            await annoncesService.delete(userRole, id);
            await fetchAnnonces();
        } catch (err) {
            throw new Error(err.response?.data?.message || "Erreur lors de la suppression");
        }
    }, [userRole, fetchAnnonces]);

    const toggleActive = useCallback(async (id) => {
        try {
            await annoncesService.toggleActive(userRole, id);
            await fetchAnnonces();
        } catch (err) {
            throw new Error(err.response?.data?.message || "Erreur de changement de statut");
        }
    }, [userRole, fetchAnnonces]);

    return {
        annonces,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        setPagination,
        refetch: fetchAnnonces,
        createAnnonce,
        deleteAnnonce,
        toggleActive
    };
};

export default useAnnonces;