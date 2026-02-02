'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { documentsAPI } from '@/lib/api/endpoints';

export const useDocuments = () => {
    const [documents, setDocuments] = useState([]);
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
    });

    const [links, setLinks] = useState({});

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // Fonction de fetch principale
    const fetchDocuments = useCallback(async (shouldResetInitialFlag = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await documentsAPI.getAll({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                ...filters,
            });

            // Vérifier si la réponse a une structure { data: [...] }
            const data = response?.data || response || [];
            const responseData = Array.isArray(data) ? data : [];

            setDocuments(responseData);

            // Mettre à jour la pagination si elle existe
            if (response?.meta) {
                setPagination((prev) => ({
                    ...prev,
                    total: response.meta.total || 0,
                    lastPage: response.meta.last_page || 1,
                    from: response.meta.from || 1,
                    to: response.meta.to || 0,
                }));
            }

            // Mettre à jour les liens si ils existent
            if (response?.links) {
                setLinks(response.links);
            }

            if (shouldResetInitialFlag) {
                initialFetchDone.current = false;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur lors de la récupération des documents:', err);
                setError(err.message || 'Une erreur est survenue');
                setDocuments([]);
            }
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    // Appel initial
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchDocuments();
        }
    }, [fetchDocuments]);

    // Réappeler quand la pagination change
    useEffect(() => {
        if (initialFetchDone.current) {
            fetchDocuments();
        }
    }, [pagination.currentPage, pagination.perPage, fetchDocuments]);

    // Réappeler quand les filtres changent
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            currentPage: 1,
        }));
    }, [filters.search]);

    // Fonctions de mutation
    const deleteDocument = useCallback(async (documentId) => {
        try {
            setLoading(true);
            await documentsAPI.delete(documentId);
            // Recharger les documents
            await fetchDocuments(true);
        } catch (err) {
            console.error('Erreur lors de la suppression du document:', err);
            setError(err.message || 'Impossible de supprimer le document');
        } finally {
            setLoading(false);
        }
    }, [fetchDocuments]);

    const downloadDocument = useCallback((documentUrl) => {
        if (documentUrl) {
            const link = document.createElement('a');
            link.href = documentUrl;
            link.download = documentUrl.split('/').pop() || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, []);

    const setSearch = useCallback((search) => {
        setFilters((prev) => ({
            ...prev,
            search: search || '',
        }));
    }, []);

    const goToPage = useCallback((page) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page,
        }));
    }, []);

    const changePerPage = useCallback((perPage) => {
        setPagination((prev) => ({
            ...prev,
            perPage,
            currentPage: 1,
        }));
    }, []);

    return {
        documents,
        loading,
        error,
        pagination,
        links,
        filters,
        fetchDocuments,
        deleteDocument,
        downloadDocument,
        setSearch,
        goToPage,
        changePerPage,
    };
};

export default useDocuments;
