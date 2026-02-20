import { anneesAcademiquesAPI, semestresAPI } from '@/lib/api/endpoints';

const cycleAcademiqueService = {
    // Années académiques
    getAllAnnees: () => anneesAcademiquesAPI.getAll(),
    getActiveAnnee: () => anneesAcademiquesAPI.getActive(),
    createAnnee: (data) => anneesAcademiquesAPI.create(data),
    updateAnnee: (id, data) => anneesAcademiquesAPI.update(id, data),
    deleteAnnee: (id) => anneesAcademiquesAPI.delete(id),
    activateAnnee: (id) => anneesAcademiquesAPI.activate(id),
    closeAnnee: (id) => anneesAcademiquesAPI.close(id),

    // Semestres
    getSemestres: (anneeId) => semestresAPI.getAll({ annee_academique_id: anneeId }),
    getActiveSemestre: () => semestresAPI.getActive(),
    createSemestre: (data) => semestresAPI.create(data),
    updateSemestre: (id, data) => semestresAPI.update(id, data),
    deleteSemestre: (id) => semestresAPI.delete(id),
    activateSemestre: (id) => semestresAPI.activate(id),
};

export default cycleAcademiqueService;