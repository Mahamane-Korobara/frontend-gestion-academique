'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { messagesService } from '@/lib/services/messages.service';

export const useMessages = () => {
    const [messages, setMessages] = useState([]);
    const [sentMessages, setSentMessages] = useState([]);
    const [currentConversationMessages, setCurrentConversationMessages] = useState([]);
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
        search: '',
        is_lu: null,
        type: null,
    });

    const [links, setLinks] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);

    // Référence pour éviter les doubles appels en Strict Mode
    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    // Fonction pour récupérer le nombre de messages non lus
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await messagesService.getUnreadCount();
            setUnreadCount(response.data?.count || 0);
        } catch (err) {
            console.error('Erreur lors du chargement du nombre de messages non lus:', err);
        }
    }, []);

    // Fonction de fetch principale
    const fetchMessages = useCallback(async (shouldResetInitialFlag = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            // Charger les messages reçus
            const receivedResponse = await messagesService.getAll({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                with_reponses: true,
                ...filters,
            });

            // Essayer de charger les messages envoyés (fallback si endpoint n'existe pas)
            let sentResponse = { data: [] };
            try {
                sentResponse = await messagesService.getSent({
                    per_page: 100,
                });
            } catch (sentErr) {
                console.warn('Endpoint /messages/sent non disponible, utilisation des messages reçus uniquement:', sentErr);
                sentResponse = { data: [] };
            }

            // Vérifier si la requête n'a pas été annulée
            if (!abortControllerRef.current.signal.aborted) {
                setMessages(receivedResponse.data || []);
                setSentMessages(sentResponse.data || []);
                setPagination({
                    currentPage: receivedResponse.meta?.current_page || 1,
                    perPage: receivedResponse.meta?.per_page || 20,
                    total: receivedResponse.meta?.total || 0,
                    lastPage: receivedResponse.meta?.last_page || 1,
                    from: receivedResponse.meta?.from || 1,
                    to: receivedResponse.meta?.to || 0,
                });
                setLinks(receivedResponse.links || {});

                if (shouldResetInitialFlag) {
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Erreur lors du chargement des messages:', {
                    message: err?.message,
                    status: err?.status,
                    data: err?.data,
                    fullError: err
                });
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
            fetchMessages(true);
            fetchUnreadCount();
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
            fetchMessages();
        }
    }, [pagination.currentPage, filters, fetchMessages]);

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
        fetchMessages();
        fetchUnreadCount();
    }, [fetchMessages, fetchUnreadCount]);

    // ============ OPÉRATIONS CRUD ============

    /**
     * Créer un nouveau message
     */
    const createMessage = useCallback(async (messageData) => {
        try {
            const response = await messagesService.create(messageData);
            // Rafraîchir la liste après création
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la création du message:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Répondre à un message
     */
    const replyToMessage = useCallback(async (messageId, replyData) => {
        try {
            const response = await messagesService.reply(messageId, replyData);
            // Rafraîchir la liste après réponse
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la réponse au message:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Marquer un message comme lu
     */
    const markAsRead = useCallback(async (messageId) => {
        try {
            const response = await messagesService.markAsRead(messageId);
            // Mettre à jour localement le message
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === messageId ? { ...msg, is_lu: true } : msg
                )
            );
            // Rafraîchir le nombre de messages non lus
            await fetchUnreadCount();
            return response;
        } catch (err) {
            console.error('Erreur lors du marquage comme lu:', err);
            throw err;
        }
    }, [fetchUnreadCount]);

    /**
     * Supprimer un message
     */
    const deleteMessage = useCallback(async (messageId) => {
        try {
            const response = await messagesService.delete(messageId);
            // Rafraîchir la liste après suppression
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la suppression du message:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Créer des messages en masse
     */
    const createMasse = useCallback(async (massData) => {
        try {
            const response = await messagesService.createMasse(massData);
            // Rafraîchir la liste après création en masse
            await refetch();
            return response;
        } catch (err) {
            console.error('Erreur lors de la création en masse:', err);
            throw err;
        }
    }, [refetch]);

    /**
     * Charger une conversation complète avec un utilisateur
     */
    const loadConversation = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await messagesService.getConversation(userId);
            console.log('Conversation loaded:', response);

            // Gérer la structure de la réponse
            const conversationMessages = response?.data || response || [];
            setCurrentConversationMessages(conversationMessages);
            return conversationMessages;
        } catch (err) {
            console.error('Erreur lors du chargement de la conversation:', {
                message: err?.message,
                status: err?.status,
                data: err?.data,
                fullError: err
            });
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // État
        messages,
        sentMessages,
        currentConversationMessages,
        pagination,
        links,
        loading,
        error,
        unreadCount,

        // Actions de base
        refetch,
        applyFilters,
        updatePagination,
        filters,

        // Opérations CRUD
        createMessage,
        replyToMessage,
        markAsRead,
        deleteMessage,
        createMasse,
        fetchUnreadCount,
        loadConversation,
    };
};

export default useMessages;
