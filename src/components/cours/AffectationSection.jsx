'use client';

import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import InfoBadge from '@/components/ui/InfoBadge';
import ActionsMenu from '@/components/partage/ActionsMenu';
import DataTableSection from '@/components/partage/DataTableSection';
import UserAvatar from '@/components/layout/UserAvatar';

export default function AffectationSection({
    cours = [],
    loading = false,
    searchQuery = '',
    onReaffecter,  // changer le prof d'un cours
    onRetirer,     // retirer le prof d'un cours
}) {
    // On aplatit cours → une ligne par affectation prof
    const affectations = useMemo(() => {
        const rows = [];
        const filtered = searchQuery.trim()
            ? cours.filter(c =>
                c.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code?.toLowerCase().includes(searchQuery.toLowerCase())  ||
                c.professeurs?.some(p =>
                    p.nom_complet?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              )
            : cours;

        filtered.forEach(c => {
            if (c.professeurs && c.professeurs.length > 0) {
                c.professeurs.forEach(prof => {
                    rows.push({ cours: c, prof });
                });
            } else {
                // Cours sans prof afficher quand même
                rows.push({ cours: c, prof: null });
            }
        });
        return rows;
    }, [cours, searchQuery]);

    const columns = [
        {
            key: 'cours',
            label: 'COURS',
            className: 'min-w-[200px]',
            render: (_, row) => (
                <div className="flex flex-col min-w-0 py-1">
                    <span className="font-bold text-sm text-gray-800 truncate">{row.cours.titre}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">{row.cours.code}</span>
                </div>
            ),
        },
        {
            key: 'niveau',
            label: 'NIVEAU',
            className: 'min-w-[120px] hidden md:table-cell',
            render: (_, row) => (
                <InfoBadge label={row.cours.niveau?.nom || '—'} variant="blue" />
            ),
        },
        {
            key: 'semestre',
            label: 'SEMESTRE',
            className: 'min-w-[100px] hidden lg:table-cell',
            render: (_, row) => (
                <span className="text-sm text-gray-600">
                    {row.cours.semestre
                        ? `${row.cours.semestre.numero}`
                        : '—'}
                </span>
            ),
        },
        {
            key: 'professeur',
            label: 'PROFESSEUR',
            className: 'min-w-[200px]',
            render: (_, row) => {
                if (!row.prof) {
                    return (
                        <button
                            onClick={() => onReaffecter?.(row.cours)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            + Assigner un professeur
                        </button>
                    );
                }
                return (
                    <div className="flex items-center gap-2">
                        <UserAvatar name={row.prof.nom_complet} variant="blue" size="sm" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {row.prof.nom_complet}
                            </p>
                            {row.prof.specialite && (
                                <p className="text-[10px] text-gray-400 truncate">
                                    {row.prof.specialite}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
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
                            {
                                icon: Pencil,
                                label: 'Changer le prof',
                                onClick: (r) => onReaffecter?.(r.cours),
                            },
                            ...(row.prof ? [
                                { type: 'separator' },
                                {
                                    icon: Trash2,
                                    label: 'Retirer le prof',
                                    onClick: (r) => onRetirer?.(r.cours, r.prof),
                                    variant: 'destructive',
                                },
                            ] : []),
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTableSection
            title="Affectations professeurs"
            columns={columns}
            data={affectations}
            loading={loading}
            count={affectations.length}
        />
    );
}