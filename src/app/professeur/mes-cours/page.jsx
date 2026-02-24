'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import InfoBadge from '@/components/ui/InfoBadge';
import DataTableSection from '@/components/partage/DataTableSection';

// Hooks
import useProfesseurCours from '@/lib/hooks/useProfesseurCours';

// Icons
import { BookMarked } from 'lucide-react';

export default function MesCoursPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { cours, total, loading } = useProfesseurCours();
  const mesCours = cours;

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
  };

  // Filtrer les données
  const filteredData = useMemo(() => {
    return mesCours.filter((cours) => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        cours.titre?.toLowerCase().includes(searchLower) ||
        cours.code?.toLowerCase().includes(searchLower) ||
        cours.filiere?.nom?.toLowerCase().includes(searchLower) ||
        cours.niveau?.nom?.toLowerCase().includes(searchLower);

      if (activeTab === 'all') return matchSearch;
      if (activeTab === 'actifs') return matchSearch && !cours.is_archived;
      if (activeTab === 'archives') return matchSearch && cours.is_archived;
      return matchSearch;
    });
  }, [mesCours, searchQuery, activeTab]);

  // Configuration des colonnes
  const columns = [
    {
      key: 'cours-titre',
      label: 'COURS',
      className: 'min-w-[250px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">
              {row.titre}
            </span>
            <span className="text-xs text-gray-500 truncate">{row.code}</span>
          </div>
        </div>
      )
    },
    {
      key: 'cours-niveau',
      label: 'NIVEAU / FILIERE',
      className: 'min-w-[240px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={`${row.niveau?.nom || 'N/A'} — ${row.filiere?.nom || 'N/A'}`}
          variant="blue"
        />
      )
    },
    {
      key: 'cours-actions',
      label: 'ACTIONS',
      className: 'w-[100px]',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Link href={`/professeur/cours/${row.id}`}>
            <Button size="sm" variant="outline">
              Voir
            </Button>
          </Link>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'all', label: 'Tous', count: total || mesCours.length },
    { id: 'actifs', label: 'Actifs', count: mesCours.filter((c) => !c.is_archived).length },
    { id: 'archives', label: 'Archivés', count: mesCours.filter((c) => c.is_archived).length },
  ];

  return (
    <ListPageLayout
      title="Mes Cours"
      description="Consultez la liste de vos cours assignés."
    >
      <ListPageFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par titre, code, niveau ou filière..."
        onReset={resetFilters}
      />

      <DataTableSection
        title="Cours assignés"
        columns={columns}
        data={filteredData}
        loading={loading}
        count={filteredData.length}
      />
    </ListPageLayout>
  );
}
