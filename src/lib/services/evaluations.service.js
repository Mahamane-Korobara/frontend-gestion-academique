import { evaluationsAPI } from '@/lib/api/endpoints';

const evaluationsService = {
    getAll: () => evaluationsAPI.getAll(),
    getByCours: (coursId) => evaluationsAPI.getByCours(coursId),
    getById: (id) => evaluationsAPI.getById(id),
    create: (coursId, data) => evaluationsAPI.create(coursId, data),
    update: (id, data) => evaluationsAPI.update(id, data),
    delete: (id) => evaluationsAPI.delete(id),
};

export default evaluationsService;