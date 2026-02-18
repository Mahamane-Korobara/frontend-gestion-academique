import { emploiDuTempsAdminAPI } from '@/lib/api/endpoints';

/**
 * Service emploi du temps — encapsule tous les appels API
 */
const emploiDuTempsService = {

    /**
     * Récupère les créneaux avec filtres optionnels
     * @param {Object} filters - { niveau_id, semestre_id, filiere_id, cours_id }
     * @param {AbortSignal} signal
     */
    async fetchAll(filters = {}, signal) {
        const params = {};
        if (filters.niveau_id) params.niveau_id = filters.niveau_id;
        if (filters.semestre_id) params.semestre_id = filters.semestre_id;
        if (filters.filiere_id) params.filiere_id = filters.filiere_id;
        if (filters.cours_id) params.cours_id = filters.cours_id;

        const res = await emploiDuTempsAdminAPI.getAll(params, signal);
        return res?.data || res || [];
    },

    /**
     * Crée un créneau
     * @param {Object} data - payload validé
     */
    async create(data) {
        return emploiDuTempsAdminAPI.create(data);
    },

    /**
     * Supprime un créneau
     * @param {number} id
     */
    async delete(id) {
        return emploiDuTempsAdminAPI.delete(id);
    },
};

export default emploiDuTempsService;