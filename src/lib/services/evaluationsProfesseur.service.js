import { professeurAPI } from '@/lib/api/endpoints';

const evaluationsProfesseurService = {
    getMesEvaluations: (params) => professeurAPI.getMesEvaluations(params),
};

export default evaluationsProfesseurService;
