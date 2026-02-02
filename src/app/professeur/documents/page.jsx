'use client';

import { useState, useMemo } from 'react';
import { Plus, Download, Trash2, File } from 'lucide-react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import DataTableSection from '@/components/partage/DataTableSection';
import Header from '@/components/layout/Header';

// Hooks
import useDocuments from '@/lib/hooks/useDocuments';

// Utils
import { formatDate, formatFileSize } from '@/lib/utils/format';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { documents, loading, deleteDocument, downloadDocument } = useDocuments();

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    
    return documents.filter((doc) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.titre?.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [documents, searchQuery]);

  // Configuration des colonnes
  const columns = [
    {
      key: 'doc-titre',
      label: 'DOCUMENT',
      className: 'min-w-[250px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
            <File className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">
              {row.titre}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {row.description}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'doc-taille',
      label: 'TAILLE',
      className: 'min-w-[100px] hidden md:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-600">
          {formatFileSize(row.taille || 0)}
        </span>
      )
    },
    {
      key: 'doc-date',
      label: 'DATE',
      className: 'min-w-[150px] hidden sm:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.created_at, 'dd/MM/yyyy')}
        </span>
      )
    },
    {
      key: 'doc-actions',
      label: 'ACTIONS',
      className: 'w-[120px]',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadDocument(row.chemin_fichier)}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => deleteDocument(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header 
        title="Documents" 
        description="Partagez vos supports pédagogiques"
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <ListPageLayout
          title="Documents"
          description="Gérez vos fichiers partagés avec les étudiants"
          actionButton={
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Ajouter Document
            </Button>
          }
        >
          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher par titre ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tableau des documents */}
          <DataTableSection
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="Aucun document trouvé"
          />
        </ListPageLayout>
      </main>
    </div>
  );
}
