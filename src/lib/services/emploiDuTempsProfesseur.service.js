import { emploiDuTempsProfesseurAPI } from '@/lib/api/endpoints';

const emploiDuTempsProfesseurService = {
    async fetchAll(filters = {}) {
        const params = {};

        if (filters.semestre_id) params.semestre_id = filters.semestre_id;
        if (filters.niveau_id) params.niveau_id = filters.niveau_id;
        if (filters.filiere_id) params.filiere_id = filters.filiere_id;
        if (filters.cours_id) params.cours_id = filters.cours_id;
        if (filters.jour) params.jour = filters.jour;

        return emploiDuTempsProfesseurAPI.getAll(params);
    },

    async fetchSemaine(params = {}) {
        return emploiDuTempsProfesseurAPI.getSemaine(params);
    },

    async fetchJour(params = {}) {
        return emploiDuTempsProfesseurAPI.getJour(params);
    },

    async fetchResume() {
        return emploiDuTempsProfesseurAPI.getResume();
    },

    async fetchMesNiveaux() {
        return emploiDuTempsProfesseurAPI.getMesNiveaux();
    },
};

export default emploiDuTempsProfesseurService;
