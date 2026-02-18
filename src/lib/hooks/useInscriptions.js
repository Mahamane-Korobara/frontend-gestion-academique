import { useState, useCallback } from 'react';
import inscriptionsService from '@/lib/services/inscriptions.service';

/**
 * Hook inscriptions — expose les actions CRUD + état de soumission
 */
export default function useInscriptions() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (fn) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fn();
            return { success: true, data: res };
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const inscrireCoursNiveau = useCallback(
        (etudiantId, data) => run(() => inscriptionsService.inscrireCoursNiveau(etudiantId, data)),
        [run]
    );

    const create = useCallback((data) => run(() => inscriptionsService.create(data)), [run]);
    const createMasse = useCallback((data) => run(() => inscriptionsService.createMasse(data)), [run]);
    const remove = useCallback((id) => run(() => inscriptionsService.delete(id)), [run]);

    return {
        isSubmitting,
        error,
        inscrireCoursNiveau,
        create,
        createMasse,
        remove,
    };
}