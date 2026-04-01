'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Download, PencilLine, RotateCcw, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';
import ActionsMenu from '@/components/partage/ActionsMenu';
import InfoBadge from '@/components/ui/InfoBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useNotesAdmin from '@/lib/hooks/useNotesAdmin';
import useCours from '@/lib/hooks/useCours';
import useSemestres from '@/lib/hooks/useSemestres';
import useFilieres from '@/lib/hooks/useFilieres';
import useNiveaux from '@/lib/hooks/useNiveaux';

const STATUS_CONFIG = {
    soumise: { label: 'Soumise', variant: 'orange' },
};

function formatDateTime(value) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function StatusBadge({ statut }) {
    const config = STATUS_CONFIG[statut] || { label: statut || '—', variant: 'gray' };
    return <InfoBadge label={config.label} variant={config.variant} />;
}

function NoteActionsMenu({ note, onReouvrir }) {
    const actions = [
        {
            icon: RotateCcw,
            label: 'Réouvrir la note',
            onClick: () => onReouvrir?.(note),
        },
    ];

    return <ActionsMenu item={note} actions={actions} />;
}

export default function NotesValidationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [reopenConfirm, setReopenConfirm] = useState({ open: false, noteIds: [] });
    const [reopenLoading, setReopenLoading] = useState(false);

    const {
        notes,
        loading,
        error,
        filters,
        updateFilter,
        resetServerFilters,
        reouvrirMasse,
        exportStatus,
        exportExcel,
    } = useNotesAdmin({ per_page: 500 });

    const { cours } = useCours({ per_page: 300 });
    const { semestresOptions, semestreActif } = useSemestres();
    const { activeFilieresOptions } = useFilieres();
    const { niveauxOptions, getNiveauxByFiliere } = useNiveaux();

    const coursOptions = useMemo(
        () =>
            (cours || []).map((c) => ({
                value: String(c.id),
                label: c.code ? `${c.code} — ${c.titre}` : c.titre,
            })),
        [cours]
    );

    const filteredNotes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return (notes || []).filter((note) => {
            if (!query) return true;

            const fields = [
                note?.etudiant?.nom,
                note?.etudiant?.email,
                note?.evaluation?.titre,
                note?.evaluation?.type,
                note?.evaluation?.cours,
                note?.saisi_par?.nom,
            ]
                .filter(Boolean)
                .map((s) => String(s).toLowerCase());

            return fields.some((value) => value.includes(query));
        });
    }, [notes, searchQuery]);

    const allVisibleIds = useMemo(() => filteredNotes.map((n) => n.id), [filteredNotes]);
    const allVisibleSelected =
        allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

    const toggleSelectAll = (checked) => {
        if (!checked) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(allVisibleIds);
    };

    const toggleSelection = (id, checked) => {
        setSelectedIds((prev) => {
            if (checked) return Array.from(new Set([...prev, id]));
            return prev.filter((item) => item !== id);
        });
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setSelectedIds([]);
    };

    useEffect(() => {
        if (!filters.semestre_id && semestreActif?.id) {
            updateFilter('semestre_id', String(semestreActif.id));
        }
    }, [filters.semestre_id, semestreActif?.id, updateFilter]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedIds([]);
        resetServerFilters();
        if (semestreActif?.id) {
            updateFilter('semestre_id', String(semestreActif.id));
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'filiere_id') {
            updateFilter('filiere_id', value || null);
            updateFilter('niveau_id', null);
        } else {
            updateFilter(key, value || null);
        }
        setSelectedIds([]);
    };

    const closeReopenConfirm = () => {
        if (reopenLoading) return;
        setReopenConfirm({ open: false, noteIds: [] });
    };

    const executeReopen = async (noteIds = []) => {
        if (!noteIds.length) return;

        setReopenLoading(true);
        try {
            const response = await reouvrirMasse(noteIds);
            if (response?.exports_invalidated) {
                toast.success('Notes réouvertes. Les exports précédents sont désormais obsolètes.');
            } else {
                toast.success('Notes réouvertes avec succès');
            }
            setSelectedIds((prev) => prev.filter((id) => !noteIds.includes(id)));
        } catch (err) {
            toast.error(err?.message || 'Erreur lors de la réouverture des notes');
        } finally {
            setReopenLoading(false);
        }
    };

    const handleReouvrir = async (noteIds = []) => {
        if (!noteIds.length) {
            toast.error('Sélectionnez au moins une note');
            return;
        }

        const semestreId = filters.semestre_id;
        const filiereId = filters.filiere_id;
        const niveauId = filters.niveau_id;

        if (semestreId) {
            try {
                const status = await exportStatus({
                    semestre_id: semestreId,
                    filiere_id: filiereId,
                    niveau_id: niveauId,
                });

                if (status?.has_export) {
                    setReopenConfirm({ open: true, noteIds });
                    return;
                }
            } catch {
                // si la vérification échoue, on laisse l'action possible
            }
        }

        await executeReopen(noteIds);
    };

    const handleExport = async () => {
        if (!filters.semestre_id) {
            toast.error('Sélectionnez un semestre pour exporter.');
            return;
        }

        try {
            const blob = await exportExcel({
                semestre_id: filters.semestre_id,
                filiere_id: filters.filiere_id || null,
                niveau_id: filters.niveau_id || null,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'notes_export.zip';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export téléchargé avec succès');
        } catch (err) {
            toast.error(err?.message || "Erreur lors de l'export");
        }
    };

    const columns = [
        {
            key: 'select',
            label: (
                <div className="flex justify-center">
                    <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                        aria-label="Sélectionner toutes les notes"
                    />
                </div>
            ),
            className: 'w-12 text-center',
            cellClassName: 'text-center',
            render: (_, row) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(checked) => toggleSelection(row.id, checked === true)}
                        aria-label={`Sélectionner la note ${row.id}`}
                    />
                </div>
            ),
        },
        {
            key: 'etudiant',
            label: 'ÉTUDIANT',
            className: 'min-w-[220px]',
            render: (_, row) => (
                <div className="flex flex-col min-w-0 py-1">
                    <span className="text-sm font-semibold text-gray-800 truncate flex items-center gap-1.5">
                        <UserRound className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {row.etudiant?.nom || '—'}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{row.etudiant?.email || '—'}</span>
                </div>
            ),
        },
        {
            key: 'evaluation',
            label: 'ÉVALUATION',
            className: 'min-w-[240px]',
            render: (_, row) => (
                <div className="flex flex-col min-w-0 py-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">{row.evaluation?.titre || '—'}</span>
                    <span className="text-xs text-gray-500 truncate">{row.evaluation?.type || '—'}</span>
                    <span className="text-xs text-gray-400 truncate">{row.evaluation?.cours || '—'}</span>
                </div>
            ),
        },
        {
            key: 'semestre',
            label: 'SEMESTRE',
            className: 'min-w-[140px] hidden lg:table-cell',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">
                        {row.evaluation?.semestre?.numero ?? '—'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {row.evaluation?.semestre?.annee ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'note',
            label: 'NOTE',
            className: 'w-28',
            render: (value, row) =>
                row.is_absent ? (
                    <InfoBadge label="Absent" variant="orange" />
                ) : (
                    <span className="font-semibold text-gray-800">{value ?? '—'}</span>
                ),
        },
        {
            key: 'statut',
            label: 'STATUT',
            className: 'w-32',
            render: (value) => <StatusBadge statut={value} />,
        },
        {
            key: 'date_saisie',
            label: 'SAISIE',
            className: 'hidden md:table-cell min-w-[170px]',
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700">{formatDateTime(value)}</span>
                    <span className="text-xs text-gray-400">Par {row.saisi_par?.nom || '—'}</span>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            className: 'w-20',
            render: (_, row) => (
                <div className="flex justify-end">
                    <NoteActionsMenu note={row} onReouvrir={() => handleReouvrir([row.id])} />
                </div>
            ),
        },
    ];

    const selectedFilters = {
        semestre_id: filters.semestre_id || '',
        filiere_id: filters.filiere_id || '',
        niveau_id: filters.niveau_id || '',
        cours_id: filters.cours_id || '',
    };

    const niveauxFiltres = useMemo(() => {
        if (filters.filiere_id) {
            return getNiveauxByFiliere(filters.filiere_id);
        }
        return niveauxOptions;
    }, [filters.filiere_id, getNiveauxByFiliere, niveauxOptions]);

    const filterOptions = [
        {
            key: 'semestre_id',
            placeholder: 'Semestre',
            options: semestresOptions,
        },
        {
            key: 'filiere_id',
            placeholder: 'Filière',
            options: activeFilieresOptions,
        },
        {
            key: 'niveau_id',
            placeholder: 'Niveau',
            options: niveauxFiltres,
        },
        {
            key: 'cours_id',
            placeholder: 'Cours',
            options: coursOptions,
        },
    ];

    const rightAction = (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">{selectedIds.length} sélectionnée(s)</span>
            <Button
                size="sm"
                variant="outline"
                onClick={() => handleReouvrir(selectedIds)}
                disabled={selectedIds.length === 0}
                className="h-8"
            >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Réouvrir la sélection
            </Button>
            <Button
                size="sm"
                onClick={handleExport}
                disabled={!filters.semestre_id}
                className="h-8"
            >
                <Download className="w-4 h-4 mr-1.5" />
                Exporter ZIP
            </Button>
        </div>
    );

    return (
        <ListPageLayout
            title="Notes soumises"
            description="Consultez les notes soumises et exportez-les par semestre."
        >
            <ListPageFilters
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Étudiant, évaluation, cours..."
                filterOptions={filterOptions}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Impossible de charger les notes soumises: {error.message}
                </div>
            )}

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-800 flex items-start gap-2">
                <PencilLine className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    Le professeur saisit et soumet les notes. L&apos;administrateur peut réouvrir une soumission
                    si une correction est nécessaire, puis exporter les notes par semestre.
                </p>
            </div>

            <DataTableSection
                title="Notes soumises"
                columns={columns}
                data={filteredNotes}
                loading={loading}
                count={filteredNotes.length}
                rightAction={rightAction}
                itemsPerPage={15}
            />

            {!loading && filteredNotes.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                    <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucune note soumise</p>
                    <p className="text-sm mt-1">Aucune soumission ne correspond à vos filtres.</p>
                </div>
            )}

            <ConfirmModal
                isOpen={reopenConfirm.open}
                onClose={closeReopenConfirm}
                onConfirm={async () => {
                    await executeReopen(reopenConfirm.noteIds);
                    closeReopenConfirm();
                }}
                loading={reopenLoading}
                title="Réouvrir les notes ?"
                message="Un export existe déjà pour ce semestre. Réouvrir va rendre cet export obsolète. Continuer ?"
                confirmLabel="Réouvrir"
                variant="warning"
            />
        </ListPageLayout>
    );
}
