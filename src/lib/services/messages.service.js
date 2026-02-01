/**
 * Service pour la gestion des messages
 */

import { messagesAPI } from '@/lib/api/endpoints';

export const messagesService = {
    /**
     * Récupérer tous les messages avec pagination
     */
    getAll: (params = {}) => messagesAPI.getAll(params),

    /**
     * Récupérer les messages envoyés avec pagination
     */
    getSent: (params = {}) => messagesAPI.getSent(params),

    /**
     * Récupérer une conversation complète avec un utilisateur
     */
    getConversation: (userId) => messagesAPI.getConversation(userId),

    /**
     * Récupérer le nombre de messages non lus
     */
    getUnreadCount: () => messagesAPI.getUnreadCount(),

    /**
     * Récupérer un message par ID
     */
    getById: (id) => messagesAPI.getById(id),

    /**
     * Créer un nouveau message
     */
    create: (data) => messagesAPI.create(data),

    /**
     * Répondre à un message
     */
    reply: (id, data) => messagesAPI.reply(id, data),

    /**
     * Marquer un message comme lu
     */
    markAsRead: (id) => messagesAPI.markAsRead(id),

    /**
     * Supprimer un message
     */
    delete: (id) => messagesAPI.delete(id),

    /**
     * Créer des messages en masse
     */
    createMasse: (data) => messagesAPI.createMasse(data),
};
