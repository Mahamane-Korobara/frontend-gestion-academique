/**
 * Service pour la gestion des annonces
 * Fonctionne pour Admin et Professeur
 */
import { annoncesAdminAPI, annoncesProfesseurAPI } from '@/lib/api/endpoints';

/**
 * Détermine quel API utiliser selon le rôle
 */
const getAPI = (role) => {
    return role === 'professeur' ? annoncesProfesseurAPI : annoncesAdminAPI;
};

export const annoncesService = {
    /**
     * Récupérer toutes les annonces avec pagination
     */
    getAll: async (role, params = {}) => {
        try {
            // Sécurité : Si pas de rôle, on ne tente même pas l'appel
            if (!role) return { data: [], meta: {} };

            const api = getAPI(role);
            const response = await api.getAll(params);

            return response;
        } catch (error) {
            console.error(`Erreur API (${role}):`, error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Récupérer une annonce par ID
     */
    getById: async (role, id) => {
        const api = getAPI(role);
        return await api.getById(id);
    },

    /**
     * Créer une nouvelle annonce
     */
    create: async (role, data) => {
        const api = getAPI(role);

        if (role === 'professeur' && data.type === 'globale') {
            throw new Error('Les professeurs ne peuvent pas créer d\'annonces globales');
        }

        return await api.create(data);
    },

    /**
     * Mettre à jour une annonce
     */
    update: async (role, id, data) => {
        const api = getAPI(role);

        if (role === 'professeur' && data.type === 'globale') {
            throw new Error('Les professeurs ne peuvent pas modifier le type vers globale');
        }

        return await api.update(id, data);
    },

    /**
     * Supprimer une annonce
     */
    delete: async (role, id) => {
        const api = getAPI(role);
        return await api.delete(id);
    },

    /**
     * Activer/Désactiver une annonce
     */
    toggleActive: async (role, id) => {
        const api = getAPI(role);
        return await api.toggleActive(id);
    },
};