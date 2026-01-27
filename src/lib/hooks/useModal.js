'use client';

import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer l'état d'un modal
 * @param {boolean} defaultOpen - État initial du modal
 * @returns {object} - { isOpen, open, close, toggle }
 * 
 * @example
 * const modal = useModal();
 * 
 * <button onClick={modal.open}>Ouvrir</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *   Contenu du modal
 * </Modal>
 */
export function useModal(defaultOpen = false) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        open,
        close,
        toggle,
        setIsOpen, // Pour un contrôle plus direct si nécessaire
    };
}

export default useModal;