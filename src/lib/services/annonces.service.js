/**
 * Service pour la gestion des annonces
 */

import { annoncesAdminAPI } from '@/lib/api/endpoints';

export const annoncesService = {
    /**
     * Récupérer toutes les annonces avec pagination
     */
    getAll: (params = {}) => annoncesAdminAPI.getAll(params),

    /**
     * Récupérer une annonce par ID
     */
    getById: (id) => annoncesAdminAPI.getById(id),

    /**
     * Créer une nouvelle annonce
     */
    create: (data) => annoncesAdminAPI.create(data),

    /**
     * Mettre à jour une annonce
     */
    update: (id, data) => annoncesAdminAPI.update(id, data),

    /**
     * Supprimer une annonce
     */
    delete: (id) => annoncesAdminAPI.delete(id),

    /**
     * Activer/Désactiver une annonce
     */
    toggleActive: (id) => annoncesAdminAPI.toggleActive(id),
};
