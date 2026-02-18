import { inscriptionsAPI } from '@/lib/api/endpoints';

/**
 * Service inscriptions — encapsule tous les appels API
 */
const inscriptionsService = {

    getAll: (params) => inscriptionsAPI.getAll(params),

    create: (data) => inscriptionsAPI.create(data),

    createMasse: (data) => inscriptionsAPI.createMasse(data),

    getByEtudiant: (etudiantId) => inscriptionsAPI.getByEtudiant(etudiantId),

    getByCours: (coursId) => inscriptionsAPI.getByCours(coursId),

    delete: (id) => inscriptionsAPI.delete(id),

    /**
     * Inscrit automatiquement un étudiant à tous les cours de son niveau/semestre actif
     * @param {number} etudiantId - ID du modèle Etudiant (pas l'id user)
     * @param {Object} data       - { filiere_id, niveau_id } (optionnel selon le backend)
     */
    inscrireCoursNiveau: (etudiantId, data = {}) =>
        inscriptionsAPI.inscrireCoursNiveau(etudiantId, data),
};

export default inscriptionsService;