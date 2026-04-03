'use client';

import { useMemo, useState } from 'react';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import useEtudiantNotes from '@/lib/hooks/useEtudiantNotes';

export default function MesNotesEtudiantPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { notes, loading } = useEtudiantNotes();

  const filteredData = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return (notes || []).filter((note) => {
      const matchSearch =
        !searchLower ||
        note.cours?.toLowerCase().includes(searchLower) ||
        note.type_evaluation?.toLowerCase().includes(searchLower) ||
        note.mention?.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      if (activeTab === 'rattrapage') return note.is_rattrapage;
      if (activeTab === 'absents') return note.is_absent;
      return true;
    });
  }, [notes, searchQuery, activeTab]);

  const counts = useMemo(() => {
    const all = notes.length;
    const rattrapage = notes.filter((n) => n.is_rattrapage).length;
    const absents = notes.filter((n) => n.is_absent).length;
    return { all, rattrapage, absents };
  }, [notes]);

  const columns = [
    {
      key: 'cours',
      label: 'COURS',
      className: 'min-w-[220px]',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gray-900">{row.cours}</span>
          <span className="text-xs text-gray-500">{row.type_evaluation}</span>
        </div>
      ),
    },
    {
      key: 'note',
      label: 'NOTE',
      className: 'min-w-[120px]',
      render: (_, row) => (
        row.is_absent ? (
          <StatusBadge status="Absent" variant="danger" />
        ) : (
          <InfoBadge label={`${row.note}/20`} variant="blue" />
        )
      ),
    },
    {
      key: 'coef',
      label: 'COEF',
      className: 'min-w-[80px] hidden md:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.coefficient}</span>
      ),
    },
    {
      key: 'mention',
      label: 'MENTION',
      className: 'min-w-[140px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge label={row.mention || '—'} variant="green" />
      ),
    },
    {
      key: 'date',
      label: 'DATE',
      className: 'min-w-[120px] hidden lg:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-500">{row.date}</span>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: 'Toutes', count: counts.all },
    { id: 'rattrapage', label: 'Rattrapage', count: counts.rattrapage },
    { id: 'absents', label: 'Absents', count: counts.absents },
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
  };

  return (
    <ListPageLayout
      title="Mes Notes"
      description="Consultez vos notes validées."
    >
      <ListPageFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par cours, type ou mention..."
        onReset={resetFilters}
      />

      <DataTableSection
        title="Historique des notes"
        columns={columns}
        data={filteredData}
        loading={loading}
      />
    </ListPageLayout>
  );
}
