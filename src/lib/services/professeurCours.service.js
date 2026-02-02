import { professeurAPI } from '@/lib/api/endpoints';

export const professeurCoursService = {
    /**
     * Récupère les options de formulaire (filieres, niveaux, cours) pour un prof
     */
    getFormOptions: async () => {
        try {
            // Utilisation de la méthode définie dans professeurAPI
            const response = await professeurAPI.getFormOptions();
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Liste simple des cours
     */
    getMesCours: async () => {
        try {
            const response = await professeurAPI.getMesCours();
            return response;
        } catch (error) {
            throw error;
        }
    }
};