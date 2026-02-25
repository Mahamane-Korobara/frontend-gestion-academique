import { professeurAPI } from '@/lib/api/endpoints';

const notesProfesseurService = {
    getEvaluations: (params) => professeurAPI.getMesEvaluations(params),
    getEvaluationNotes: (evaluationId) => professeurAPI.getEvaluationNotes(evaluationId),
    saveNotes: (evaluationId, payload) => professeurAPI.saisirNotes(evaluationId, payload),
};

export default notesProfesseurService;
