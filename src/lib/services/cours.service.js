import { coursAPI } from '@/lib/api/endpoints';

export const coursService = {
    async getAll(params = {}) {
        const response = await coursAPI.getAll(params);
        return response;
    },

    async getById(id) {
        const response = await coursAPI.getById(id);
        return response;
    },

    async create(data) {
        const response = await coursAPI.create(data);
        return response;
    },

    async update(id, data) {
        const response = await coursAPI.update(id, data);
        return response;
    },

    async delete(id) {
        const response = await coursAPI.delete(id);
        return response;
    },

    async affecterProfesseurs(coursId, data) {
        const response = await coursAPI.affecterProfesseurs(coursId, data);
        return response;
    },

    async retirerProfesseur(coursId, professeurId) {
        const response = await coursAPI.retirerProfesseur(coursId, professeurId);
        return response;
    }
};