import { useState } from 'react';
import { toast } from 'sonner';

export function useModalOperations() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const executeOperation = async (
        operation,
        successMessage,
        errorMessage = 'Une erreur est survenue'
    ) => {
        setIsSubmitting(true);
        setValidationErrors({}); // reset à chaque tentative
        try {
            const result = await operation();
            toast.success(successMessage);
            return { success: true, data: result };
        } catch (error) {
            // ApiClient throw { status, message, errors }
            if (error.status === 422 && error.errors) {
                setValidationErrors(error.errors);
                toast.error('Veuillez corriger les erreurs du formulaire');
            } else {
                const message = error?.data?.error || error.message || errorMessage;
                toast.error(message);
            }
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    };

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
        validationErrors,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSimpleOperation,
        executeOperation
    };
}
