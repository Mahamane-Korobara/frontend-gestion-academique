import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook pour gérer les opérations CRUD avec modales et toasts
 */
export function useModalOperations() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Exécute une opération avec gestion d'erreur et toast
     */
    const executeOperation = async (
        operation,
        successMessage,
        errorMessage = 'Une erreur est survenue'
    ) => {
        setIsSubmitting(true);
        try {
            const result = await operation();
            toast.success(successMessage);
            return { success: true, data: result };
        } catch (error) {
            const message = error.response?.data?.message || error.message || errorMessage;
            toast.error(message);
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Gère une opération de création
     */
    const handleCreate = async (createFn, formData, modal, successMessage) => {
        const result = await executeOperation(
            () => createFn(formData),
            successMessage || 'Élément créé avec succès',
            'Erreur lors de la création'
        );

        if (result.success) {
            modal.close();
        }

        return result;
    };

    /**
     * Gère une opération de modification
     */
    const handleUpdate = async (updateFn, id, formData, modal, successMessage, onSuccess) => {
        const result = await executeOperation(
            () => updateFn(id, formData),
            successMessage || 'Élément modifié avec succès',
            'Erreur lors de la modification'
        );

        if (result.success) {
            modal.close();
            if (onSuccess) onSuccess();
        }

        return result;
    };

    /**
     * Gère une opération de suppression
     */
    const handleDelete = async (deleteFn, id, modal, successMessage, onSuccess) => {
        const result = await executeOperation(
            () => deleteFn(id),
            successMessage || 'Élément supprimé avec succès',
            'Erreur lors de la suppression'
        );

        if (result.success) {
            modal.close();
            if (onSuccess) onSuccess();
        }

        return result;
    };

    /**
     * Gère une opération simple (sans modal)
     */
    const handleSimpleOperation = async (operationFn, successMessage, errorMessage) => {
        return executeOperation(operationFn, successMessage, errorMessage);
    };

    return {
        isSubmitting,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSimpleOperation,
        executeOperation
    };
}