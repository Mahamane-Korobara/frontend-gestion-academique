'use client';

import { useMemo, useState } from 'react';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';
import InfoBadge from '@/components/ui/InfoBadge';
import useEtudiantCours from '@/lib/hooks/useEtudiantCours';
import { BookMarked } from 'lucide-react';

export default function MesCoursEtudiantPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { cours, loading } = useEtudiantCours();

  const filteredData = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    if (!searchLower) return cours;

    return (cours || []).filter((c) => {
      const profs = (c.professeurs || [])
        .map((p) => p.nom_complet?.toLowerCase())
        .join(' ');

      return (
        c.titre?.toLowerCase().includes(searchLower) ||
        c.code?.toLowerCase().includes(searchLower) ||
        c.filiere?.toLowerCase().includes(searchLower) ||
        c.niveau?.toLowerCase().includes(searchLower) ||
        profs.includes(searchLower)
      );
    });
  }, [cours, searchQuery]);

  const columns = [
    {
      key: 'cours',
      label: 'COURS',
      className: 'min-w-[240px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">{row.titre}</span>
            <span className="text-xs text-gray-500 truncate">{row.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'filiere-niveau',
      label: 'NIVEAU / FILIERE',
      className: 'min-w-[220px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge label={`${row.niveau || 'N/A'} — ${row.filiere || 'N/A'}`} variant="blue" />
      ),
    },
    {
      key: 'coef',
      label: 'COEF',
      className: 'min-w-[80px] hidden sm:table-cell',
      render: (_, row) => <span className="text-sm text-gray-600">{row.coefficient}</span>,
    },
    {
      key: 'professeurs',
      label: 'PROFESSEURS',
      className: 'min-w-[220px] hidden lg:table-cell',
      render: (_, row) => (
        <div className="text-xs text-gray-600">
          {(row.professeurs || []).length === 0
            ? '—'
            : row.professeurs.map((p) => p.nom_complet).join(', ')}
        </div>
      ),
    },
  ];

  return (
    <ListPageLayout
      title="Mes Cours"
      description="Consultez les cours auxquels vous êtes inscrit."
    >
      <ListPageFilters
        tabs={[{ id: 'all', label: 'Tous', count: cours.length }]}
        activeTab="all"
        onTabChange={() => {}}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par cours, code, filière ou professeur..."
        onReset={() => setSearchQuery('')}
      />

      <DataTableSection
        title="Cours inscrits"
        columns={columns}
        data={filteredData}
        loading={loading}
      />
    </ListPageLayout>
  );
}
