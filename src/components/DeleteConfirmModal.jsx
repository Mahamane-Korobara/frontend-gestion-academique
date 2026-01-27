'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from './Modal';

/**
 * Modal de confirmation de suppression
 * @param {boolean} isOpen - État d'ouverture
 * @param {function} onClose - Fermer le modal
 * @param {function} onConfirm - Confirmer la suppression
 * @param {boolean} loading - État de chargement
 * @param {string} title - Titre personnalisé
 * @param {string} message - Message personnalisé
 * @param {string} itemName - Nom de l'élément à supprimer
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirmer la suppression',
  message,
  itemName,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      <div className="text-center">
        {/* Icône d'avertissement */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Titre */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-sm text-gray-600 mb-6 space-y-2">
          <p>
            {message || (
              <>
                Êtes-vous sûr de vouloir supprimer{' '}
                {itemName ? (
                  <span className="font-semibold text-gray-900">
                    {itemName}
                  </span>
                ) : (
                  'cet élément'
                )}
                {' '}?
              </>
            )}
          </p>
          <p className="text-red-600 font-medium">
            Cette action est irréversible.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-25"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="min-w-25"
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}