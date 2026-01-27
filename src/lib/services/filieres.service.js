/**
 * Service pour la gestion des filières
 */

import { filieresAPI } from '@/lib/api/endpoints';

export const filieresService = {
    /**
     * Récupérer toutes les filières
     */
    getAll: (params = {}) => filieresAPI.getAll(params),

    /**
     * Récupérer une filière par ID
     */
    getById: (id) => filieresAPI.getById(id),

    /**
     * Créer une nouvelle filière
     */
    create: (data) => filieresAPI.create(data),

    /**
     * Mettre à jour une filière
     */
    update: (id, data) => filieresAPI.update(id, data),

    /**
     * Supprimer une filière
     */
    delete: (id) => filieresAPI.delete(id),

    /**
     * Créer les niveaux standards pour une filière (L1, L2, L3)
     */
    createStandardLevels: (id) => filieresAPI.createStandardLevels(id),
};