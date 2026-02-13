/**
 * Composant wrapper pour les pages de gestion (utilisateurs, annonces, etc.)
 * Gère le layout global, les modals et les états
 */

'use client';

import Header from '@/components/layout/Header';
import Modal from './Modal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ListPageLayout({
  // En-tête
  title,
  description,
  actionButton = null,

  // Contenu principal
  children,

  // Modals
  createModal,
  editModal,
  deleteModal,
  viewModal,

  // États
  isSubmitting = false,
  selectedItem = null,

  // Contenu des modals
  createModalTitle = 'Créer',
  createModalDescription = '',
  createModalContent = null,
  
  editModalTitle = 'Modifier',
  editModalDescription = '',
  editModalContent = null,
  
  deleteModalTitle = 'Confirmer la suppression',
  deleteModalItemName = '',
  onDeleteConfirm = null,
  
  viewModalTitle = 'Détails',
  viewModalContent = null,

  uploadModal,
  uploadModalTitle,
  uploadModalContent,
}) {
  return (
    <div>
      <Header 
        title={title}
        description={description}
        actions={actionButton}
      />

      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {children}
      </main>

      {/* Modal de création */}
      {createModal && createModalContent && (
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          title={createModalTitle}
          description={createModalDescription}
          size="lg"
          closeOnOverlayClick={!isSubmitting}
          showCloseButton={!isSubmitting}
        >
          {createModalContent}
        </Modal>
      )}

      {/* Modal de modification */}
      {editModal && editModalContent && (
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.close();
          }}
          title={editModalTitle}
          description={editModalDescription}
          size="lg"
          closeOnOverlayClick={!isSubmitting}
          showCloseButton={!isSubmitting}
        >
          {editModalContent}
        </Modal>
      )}

      {/* Modal de visualisation */}
      {viewModal && viewModalContent && (
        <Modal
          isOpen={viewModal.isOpen}
          onClose={() => {
            viewModal.close();
          }}
          title={viewModalTitle}
          size="lg"
        >
          {viewModalContent}
        </Modal>
      )}

      {/* Modal de suppression */}
      {deleteModal && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.close();
          }}
          onConfirm={onDeleteConfirm}
          loading={isSubmitting}
          itemName={deleteModalItemName}
          title={deleteModalTitle}
        />
      )}

      {uploadModal && (
        <Dialog open={uploadModal.isOpen} onOpenChange={uploadModal.toggle}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{uploadModalTitle}</DialogTitle>
            </DialogHeader>
            {uploadModalContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
