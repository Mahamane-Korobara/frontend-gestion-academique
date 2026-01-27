/**
 * Service pour la gestion des utilisateurs
 */

import { usersAPI } from '@/lib/api/endpoints';

export const usersService = {
    /**
     * Récupérer tous les utilisateurs avec pagination
     */
    getAll: (params = {}) => usersAPI.getAll(params),

    /**
     * Récupérer un utilisateur par ID
     */
    getById: (id) => usersAPI.getById(id),

    /**
     * Créer un nouvel utilisateur
     */
    create: (data) => usersAPI.create(data),

    /**
     * Mettre à jour un utilisateur
     */
    update: (id, data) => usersAPI.update(id, data),

    /**
     * Supprimer un utilisateur
     */
    delete: (id) => usersAPI.delete(id),

    /**
     * Réinitialiser le mot de passe d'un utilisateur
     */
    resetPassword: (id) => usersAPI.resetPassword(id),

    /**
     * Activer/Désactiver un utilisateur
     */
    toggleActive: (id) => usersAPI.toggleActive(id),
};
