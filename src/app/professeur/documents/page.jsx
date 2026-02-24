'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import DocumentActionsMenu from '@/components/partage/DocumentActionsMenu';

// Composants de Section
import DocumentsSection from '@/components/documents/DocumentsSection';
import DocumentViewModal from '@/components/documents/DocumentViewModal';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';

// Hooks
import useDocuments from '@/lib/hooks/useDocuments';
import useAuth from '@/lib/hooks/useAuth';
import useModal from '@/lib/hooks/useModal';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

// Helpers
import {
  getTypeIcon,
  getTypeLabel,
  filterDocuments,
  countDocumentsByType,
  getDocumentStats,
} from '@/lib/utils/documentHelpers';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const viewModal = useModal();
  const deleteModal = useModal();
  const uploadModal = useModal();

  const { user } = useAuth();
  const { 
    documents, 
    loading, 
    uploadDocument,
    deleteDocument, 
    downloadDocument,
    canUpload,
    canDelete,
  } = useDocuments();
  const { isSubmitting, handleDelete } = useModalOperations();

  // ============ LOGIQUE DE DONNÉES ============
  const stats = useMemo(() => getDocumentStats(documents), [documents]);

  const filteredData = useMemo(() => {
    return filterDocuments(documents, activeTab, searchQuery);
  }, [documents, activeTab, searchQuery]);

  // ============ HANDLERS ============
  const handleConfirmDelete = () => {
    return handleDelete(
      deleteDocument,
      selectedDocument.id,
      deleteModal,
      'Document supprimé avec succès',
      () => setSelectedDocument(null)
    );
  };

  const handleDownload = (doc) => {
    downloadDocument(doc.id, doc.fichier_original || doc.titre);
  };

  // ============ CONFIGURATION DES COLONNES ============
  const columns = [
    {
      key: 'doc-titre',
      label: 'DOCUMENT',
      className: 'min-w-[280px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-xl">
            {getTypeIcon(row.type)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">{row.titre}</span>
            <span className="text-xs text-gray-500 truncate line-clamp-1">{row.description || 'Aucune description'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'doc-type',
      label: 'TYPE',
      className: 'min-w-[120px] hidden lg:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={getTypeLabel(row.type)} 
          variant="blue"
        />
      )
    },
    {
      key: 'doc-cours',
      label: 'COURS',
      className: 'min-w-[180px] hidden md:table-cell',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{row.cours?.titre}</span>
          <span className="text-xs text-gray-500">{row.cours?.code}</span>
        </div>
      )
    },
    {
      key: 'doc-taille',
      label: 'TAILLE',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.taille}</span>
      )
    },
    {
      key: 'doc-date',
      label: 'DATE',
      className: 'min-w-[120px] hidden xl:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-500">{row.created_at}</span>
      )
    },
    {
      key: 'doc-actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <DocumentActionsMenu 
            document={row} 
            currentUserId={user?.id}
            canDelete={canDelete}
            onView={(d) => { setSelectedDocument(d); viewModal.open(); }} 
            onDownload={handleDownload}
            onDelete={(d) => { setSelectedDocument(d); deleteModal.open(); }} 
          />
        </div>
      )
    }
  ];

  // ============ MODAL CONTENT ============
  const viewModalContent = <DocumentViewModal document={selectedDocument} />;
  const uploadModalContent = (
    <DocumentUploadModal
      onClose={uploadModal.close}
      onUploadDocument={uploadDocument}
    />
  );

  return (
    <ListPageLayout
      title="Bibliothèque de Documents"
      description="Gérez et partagez vos supports pédagogiques avec les étudiants."
      actionButton={
        canUpload && (
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={uploadModal.open}
          >
            <Plus className="w-4 h-4 mr-2" /> Nouveau Document
          </Button>
        )
      }
      viewModal={viewModal}
      deleteModal={deleteModal}
      uploadModal={uploadModal}
      isSubmitting={isSubmitting}
      selectedItem={selectedDocument}
      viewModalTitle="Détails du document"
      viewModalContent={viewModalContent}
      uploadModalTitle="Télécharger un document"
      uploadModalContent={uploadModalContent}
      deleteModalItemName={selectedDocument?.titre || 'ce document'}
      onDeleteConfirm={handleConfirmDelete}
    >
      <TabNavigation
        tabs={[
          { id: 'documents', label: 'Mes Documents' },
        ]}
        activeTab="documents"
        onTabChange={() => {}}
      />

      <DocumentsSection 
        stats={stats}
        tabs={[
          { id: 'tous', label: 'Tous', count: documents?.length || 0 },
          { id: 'pdf', label: 'PDF', count: countDocumentsByType(documents, 'pdf') },
          { id: 'word', label: 'Word', count: countDocumentsByType(documents, 'word') },
          { id: 'excel', label: 'Excel', count: countDocumentsByType(documents, 'excel') },
          { id: 'powerpoint', label: 'PowerPoint', count: countDocumentsByType(documents, 'powerpoint') },
          { id: 'image', label: 'Images', count: countDocumentsByType(documents, 'image') }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={() => setSearchQuery('')}
        columns={columns}
        filteredData={filteredData}
        loading={loading}
      />
    </ListPageLayout>
  );
}
