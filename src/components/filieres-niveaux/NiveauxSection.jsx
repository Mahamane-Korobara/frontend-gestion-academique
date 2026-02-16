'use client';

import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import InfoBadge from '@/components/ui/InfoBadge';
import ActionsMenu from '@/components/partage/ActionsMenu';
import DataTableSection from '@/components/partage/DataTableSection';

export default function NiveauxSection({
  niveaux = [],
  loading = false,
  searchQuery = '',
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return niveaux;
    const q = searchQuery.toLowerCase();
    return niveaux.filter(
      n =>
        n.nom?.toLowerCase().includes(q) ||
        n.filiere?.nom?.toLowerCase().includes(q)
    );
  }, [niveaux, searchQuery]);

  const columns = [
    {
      key: 'identite',
      label: 'NIVEAU',
      className: 'min-w-[160px]',
      render: (_, row) => (
        <div className="flex flex-col min-w-0 py-1">
          <span className="font-bold text-sm text-gray-800">{row.nom}</span>
          <span className="text-[10px] text-gray-400 uppercase font-medium">
            Ordre : {row.ordre ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'filiere',
      label: 'FILIÈRE',
      className: 'min-w-[160px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge label={row.filiere?.nom || '—'} variant="blue" />
      ),
    },
    {
      key: 'nombre_semestres',
      label: 'SEMESTRES',
      className: 'min-w-[90px] hidden lg:table-cell',
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.nombre_semestres ?? '—'}</span>
      ),
    },
    {
      key: 'cours_count',
      label: 'COURS',
      className: 'min-w-[80px] hidden lg:table-cell',
      render: (_, row) => (
        <InfoBadge label={`${row.cours_count ?? 0} cours`} variant="blue" />
      ),
    },
    {
      key: 'etudiants_count',
      label: 'ÉTUDIANTS',
      className: 'min-w-[90px] hidden sm:table-cell',
      render: (_, row) => (
        <InfoBadge label={`${row.etudiants_count ?? 0} étudiant(s)`} variant="blue" />
      ),
    },
    // ✅ Pas de StatusBadge : les niveaux n'ont pas is_active dans le JSON
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
      title="Liste des niveaux"
      columns={columns}
      data={filtered}
      loading={loading}
      count={filtered.length}
    />
  );
}