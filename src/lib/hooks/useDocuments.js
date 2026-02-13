'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { documentsAPI, documentsEtudiantAPI } from '@/lib/api/endpoints';
import useAuth from '@/lib/hooks/useAuth';

export default function useDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
        from: 1,
        to: 0,
    });

    const [filters, setFilters] = useState({
        filiere_id: null,
        niveau_id: null,
        cours_id: null,
        type: null,
    });

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // ============ DÉTECTION DU RÔLE ============
    /**
     * Retourne l'API appropriée selon le rôle de l'utilisateur
     */
    const getDocumentsAPI = useCallback(() => {
        const role = user?.role?.name;
        return role === 'etudiant' ? documentsEtudiantAPI : documentsAPI;
    }, [user]);

    const isEtudiant = user?.role?.name === 'etudiant';

    // ============ FONCTION DE FETCH PRINCIPALE ============
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

            // Construire les paramètres de requête
            const params = {
                page: pagination.currentPage,
                per_page: pagination.perPage,
            };

            // Ajouter les filtres s'ils sont définis
            if (filters.filiere_id) params.filiere_id = filters.filiere_id;
            if (filters.niveau_id) params.niveau_id = filters.niveau_id;
            if (filters.cours_id) params.cours_id = filters.cours_id;
            if (filters.type) params.type = filters.type;

            // Utiliser l'API appropriée selon le rôle
            const api = getDocumentsAPI();
            const response = await api.getAll(params);

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
    }, [pagination.currentPage, pagination.perPage, filters, getDocumentsAPI]);

    // ============ EFFETS ============
    // Appel initial
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchDocuments();
        }
    }, [fetchDocuments]);

    // Réappeler quand la pagination ou les filtres changent
    useEffect(() => {
        if (initialFetchDone.current) {
            fetchDocuments();
        }
    }, [pagination.currentPage, pagination.perPage, filters]);

    // ============ MÉTHODES DE MUTATION ============

    /**
     * Télécharger (upload) un nouveau document
     * UNIQUEMENT POUR LES PROFESSEURS
     */
    const uploadDocument = useCallback(async (formData) => {
        // Vérifier que l'utilisateur est un professeur
        if (isEtudiant) {
            throw new Error('Les étudiants ne peuvent pas uploader de documents');
        }

        try {
            setLoading(true);
            // documentsAPI.create gère déjà le FormData (3ème paramètre à true)
            const response = await documentsAPI.create(formData);

            // Mise à jour optimiste
            const newDocument = response?.data || response;
            if (newDocument) {
                setDocuments((prev) => [newDocument, ...prev]);
            }

            // Recharger les documents
            await fetchDocuments(true);

            return newDocument;
        } catch (err) {
            console.error('Erreur lors du téléchargement du document:', err);

            // Gérer les erreurs de validation du backend
            if (err.errors) {
                throw {
                    message: err.message,
                    validationErrors: err.errors
                };
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchDocuments, isEtudiant]);

    /**
     * Supprimer un document
     * UNIQUEMENT POUR LES PROFESSEURS (propriétaires)
     */
    const deleteDocument = useCallback(async (documentId) => {
        // Vérifier que l'utilisateur est un professeur
        if (isEtudiant) {
            throw new Error('Les étudiants ne peuvent pas supprimer de documents');
        }

        try {
            setLoading(true);
            await documentsAPI.delete(documentId);

            // Mise à jour optimiste
            setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

            // Recharger les documents
            await fetchDocuments(true);
        } catch (err) {
            console.error('Erreur lors de la suppression du document:', err);
            setError(err.message || 'Impossible de supprimer le document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchDocuments, isEtudiant]);

    /**
     * Télécharger (download) un document
     * DISPONIBLE POUR TOUS (professeurs et étudiants)
     */
    const downloadDocument = useCallback(async (documentId, fileName = 'document') => {
        try {
            if (!documentId) {
                throw new Error('ID du document non fourni');
            }

            // Utiliser l'API appropriée selon le rôle
            const api = getDocumentsAPI();
            const blob = await api.download(documentId);

            // Créer un URL temporaire pour le blob
            const url = window.URL.createObjectURL(blob);

            // Créer un lien temporaire pour télécharger
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Nettoyer
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erreur lors du téléchargement du document:', err);
            throw err;
        }
    }, [getDocumentsAPI]);

    // ============ MÉTHODES DE FILTRAGE ============

    const setFiliere = useCallback((filiereId) => {
        setFilters((prev) => ({
            ...prev,
            filiere_id: filiereId,
        }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    const setNiveau = useCallback((niveauId) => {
        setFilters((prev) => ({
            ...prev,
            niveau_id: niveauId,
        }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    const setCours = useCallback((coursId) => {
        setFilters((prev) => ({
            ...prev,
            cours_id: coursId,
        }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    const setType = useCallback((type) => {
        setFilters((prev) => ({
            ...prev,
            type: type,
        }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            filiere_id: null,
            niveau_id: null,
            cours_id: null,
            type: null,
        });
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    // ============ MÉTHODES DE PAGINATION ============

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
        // État
        documents,
        loading,
        error,
        pagination,
        filters,

        // Informations de l'utilisateur
        isEtudiant,
        canUpload: !isEtudiant, // Les professeurs peuvent uploader
        canDelete: !isEtudiant, // Les professeurs peuvent supprimer

        // Méthodes de mutation
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        downloadDocument,

        // Méthodes de filtrage
        setFiliere,
        setNiveau,
        setCours,
        setType,
        resetFilters,

        // Méthodes de pagination
        goToPage,
        changePerPage,
    };
}