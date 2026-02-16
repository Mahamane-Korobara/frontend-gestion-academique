'use client';

import { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionsMenu from '@/components/partage/ActionsMenu';
import DataTableSection from '@/components/partage/DataTableSection';

export default function FilieresSection({
  filieres = [],
  loading = false,
  searchQuery = '',
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return filieres;
    const q = searchQuery.toLowerCase();
    return filieres.filter(
      f => f.nom?.toLowerCase().includes(q) || f.code?.toLowerCase().includes(q)
    );
  }, [filieres, searchQuery]);

  const columns = [
    {
      key: 'identite',
      label: 'FILIÈRE',
      className: 'min-w-[200px]',
      render: (_, row) => (
        <div className="flex flex-col min-w-0 py-1">
          <span className="font-bold text-sm text-gray-800 truncate">{row.nom}</span>
          <span className="text-[10px] text-gray-400 uppercase font-medium">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      className: 'min-w-[220px] hidden md:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-500" title={row.description || ''}>
          {row.description
            ? row.description.length > 30
              ? row.description.slice(0, 30) + '…'
              : row.description
            : '—'}
        </span>
      ),
    },
    {
      key: 'niveaux_count',
      label: 'NIVEAUX',
      className: 'min-w-[90px] hidden sm:table-cell',
      render: (_, row) => (
        <InfoBadge
          label={`${row.niveaux_count ?? row.niveaux?.length ?? 0} niveau(x)`}
          variant="blue"
        />
      ),
    },
    {
      key: 'etudiants_count',
      label: 'ÉTUDIANTS',
      className: 'min-w-[90px] hidden lg:table-cell',
      render: (_, row) => (
        <InfoBadge label={`${row.etudiants_count ?? 0} étudiant(s)`} variant="blue" />
      ),
    },
    {
      key: 'is_active',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge status={row.is_active ? 'Actif' : 'Inactif'} />
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      className: 'w-[80px]',
      render: (_, row) => (
        <div className="flex justify-end">
          <ActionsMenu
            item={row}
            actions={[
              { icon: Pencil, label: 'Modifier',   onClick: onEdit },
              { type: 'separator' },
              { icon: Trash2,  label: 'Supprimer', onClick: onDelete, variant: 'destructive' },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTableSection
      title="Liste des filières"
      columns={columns}
      data={filtered}
      loading={loading}
      count={filtered.length}
    />
  );
}