/**
 * Service pour la gestion des annonces
 * Fonctionne pour Admin et Professeur
 */

import { annoncesAdminAPI, annoncesProfesseurAPI } from '@/lib/api/endpoints';

/**
 * Détermine quel API utiliser selon le rôle
 */
const getAPI = (role) => {
    if (role === 'professeur') {
        return annoncesProfesseurAPI;
    }
    return annoncesAdminAPI;
};

export const annoncesService = {
    /**
     * Récupérer toutes les annonces avec pagination
     * @param {string} role - 'admin' ou 'professeur'
     * @param {object} params - Paramètres de filtrage et pagination
     */
    getAll: (role, params = {}) => {
        const api = getAPI(role);
        return api.getAll(params);
    },

    /**
     * Récupérer une annonce par ID
     * @param {string} role - 'admin' ou 'professeur'
     * @param {number} id - ID de l'annonce
     */
    getById: (role, id) => {
        const api = getAPI(role);
        return api.getById(id);
    },

    /**
     * Créer une nouvelle annonce
     * @param {string} role - 'admin' ou 'professeur'
     * @param {object} data - Données de l'annonce
     */
    create: (role, data) => {
        const api = getAPI(role);

        // Les professeurs ne peuvent créer que des annonces de type 'classe'
        if (role === 'professeur' && data.type === 'globale') {
            throw new Error('Les professeurs ne peuvent pas créer d\'annonces globales');
        }

        return api.create(data);
    },

    /**
     * Mettre à jour une annonce
     * @param {string} role - 'admin' ou 'professeur'
     * @param {number} id - ID de l'annonce
     * @param {object} data - Données à mettre à jour
     */
    update: (role, id, data) => {
        const api = getAPI(role);

        // Les professeurs ne peuvent pas modifier le type vers 'globale'
        if (role === 'professeur' && data.type === 'globale') {
            throw new Error('Les professeurs ne peuvent pas créer d\'annonces globales');
        }

        return api.update(id, data);
    },

    /**
     * Supprimer une annonce
     * @param {string} role - 'admin' ou 'professeur'
     * @param {number} id - ID de l'annonce
     */
    delete: (role, id) => {
        const api = getAPI(role);
        return api.delete(id);
    },

    /**
     * Activer/Désactiver une annonce
     * @param {string} role - 'admin' ou 'professeur'
     * @param {number} id - ID de l'annonce
     */
    toggleActive: (role, id) => {
        const api = getAPI(role);
        return api.toggleActive(id);
    },
};