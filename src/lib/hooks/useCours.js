'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { coursService } from '@/lib/services/cours.service';

export const useCours = (initialFilters = {}) => {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1
    });

    const [filters, setFilters] = useState({
        search: '',
        filiere_id: '',
        niveau_id: '',
        ...initialFilters
    });

    const abortControllerRef = useRef(null);

    const fetchCours = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const response = await coursService.getAll({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                ...filters
            });

            if (!abortControllerRef.current.signal.aborted) {
                setCours(response.data || []);
                setPagination({
                    currentPage: response.meta?.current_page || 1,
                    perPage: response.meta?.per_page || 15,
                    total: response.meta?.total || 0,
                    lastPage: response.meta?.last_page || 1
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                console.error('Erreur chargement cours:', err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) setLoading(false);
        }
    }, [pagination.currentPage, pagination.perPage, filters]);

    // Chargement initial et au changement de filtres
    useEffect(() => {
        fetchCours();
        return () => abortControllerRef.current?.abort();
    }, [fetchCours]);

    // --- ACTIONS ---

    const createCours = useCallback(async (data) => {
        const res = await coursService.create(data);
        await fetchCours();
        return res;
    }, [fetchCours]);

    const updateCours = useCallback(async (id, data) => {
        const res = await coursService.update(id, data);
        await fetchCours();
        return res;
    }, [fetchCours]);

    const deleteCours = useCallback(async (id) => {
        const res = await coursService.delete(id);
        await fetchCours();
        return res;
    }, [fetchCours]);

    const affecterProfesseurs = useCallback(async (coursId, ids) => {
        const res = await coursService.affecterProfesseurs(coursId, ids);
        await fetchCours();
        return res;
    }, [fetchCours]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    return {
        cours,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        setPage: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
        createCours,
        updateCours,
        deleteCours,
        affecterProfesseurs,
        refetch: fetchCours
    };
};

export default useCours;