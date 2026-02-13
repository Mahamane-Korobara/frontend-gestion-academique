import { niveauxAPI } from '@/lib/api/endpoints';

export const niveauxService = {
    getAll: (params = {}) => niveauxAPI.getAll(params),
    getById: (id) => niveauxAPI.getById(id),
    getByFiliere: (filiereId) => niveauxAPI.getByFiliere(filiereId),
    create: (data) => niveauxAPI.create(data),
    update: (id, data) => niveauxAPI.update(id, data),
    delete: (id) => niveauxAPI.delete(id),
};