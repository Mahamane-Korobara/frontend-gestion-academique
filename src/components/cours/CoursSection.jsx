'use client';

import { useMemo } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';

import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionsMenu from '@/components/partage/ActionsMenu';
import DataTableSection from '@/components/partage/DataTableSection';
import UserAvatar from '@/components/layout/UserAvatar';

export default function CoursSection({
    cours = [],
    loading = false,
    searchQuery = '',
    onEdit,
    onDelete,
    onAffecter, // ouvre modal affectation
}) {
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return cours;
        const q = searchQuery.toLowerCase();
        return cours.filter(
            c =>
                c.titre?.toLowerCase().includes(q) ||
                c.code?.toLowerCase().includes(q)  ||
                c.niveau?.nom?.toLowerCase().includes(q)
        );
    }, [cours, searchQuery]);

    const columns = [
        {
            key: 'identite',
            label: 'COURS',
            className: 'min-w-[200px]',
            render: (_, row) => (
                <div className="flex flex-col min-w-0 py-1">
                    <span className="font-bold text-sm text-gray-800 truncate">{row.titre}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">{row.code}</span>
                </div>
            ),
        },
        {
            key: 'niveau',
            label: 'NIVEAU / FILIÈRE',
            className: 'min-w-[150px] hidden md:table-cell',
            render: (_, row) => (
                <div className="flex flex-col gap-0.5">
                    <InfoBadge label={row.niveau?.nom || '—'} variant="blue" />
                    <span className="text-[10px] text-gray-400 truncate pl-1">
                        {row.niveau?.filiere || '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'semestre',
            label: 'SEMESTRE',
            className: 'min-w-[100px] hidden lg:table-cell',
            render: (_, row) => (
                <span className="text-sm text-gray-600">
                    {row.semestre ? `${row.semestre.numero} — ${row.semestre.annee ?? ''}` : '—'}
                </span>
            ),
        },
        {
            key: 'coefficient',
            label: 'COEFF.',
            className: 'min-w-[70px] hidden lg:table-cell',
            render: (_, row) => (
                <span className="text-sm font-semibold text-gray-700">{row.coefficient ?? '—'}</span>
            ),
        },
        {
            key: 'professeurs',
            label: 'PROFESSEUR(S)',
            className: 'min-w-[160px] hidden sm:table-cell',
            render: (_, row) => {
                const profs = row.professeurs || [];
                if (profs.length === 0) {
                    return (
                        <button
                            onClick={() => onAffecter?.(row)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            + Assigner
                        </button>
                    );
                }
                return (
                    <div className="flex items-center gap-1.5">
                        <UserAvatar name={profs[0].nom_complet} variant="blue" size="xs" />
                        <span className="text-xs text-gray-700 truncate max-w-25">
                            {profs[0].nom_complet}
                        </span>
                        {profs.length > 1 && (
                            <span className="text-[10px] text-gray-400">+{profs.length - 1}</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'is_active',
            label: 'STATUT',
            className: 'min-w-[90px] hidden sm:table-cell',
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
                            { icon: Users,  label: 'Affecter prof', onClick: onAffecter },
                            { type: 'separator' },
                            { icon: Trash2, label: 'Supprimer',  onClick: onDelete, variant: 'destructive' },
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTableSection
            title="Liste des cours"
            columns={columns}
            data={filtered}
            loading={loading}
            count={filtered.length}
        />
    );
}