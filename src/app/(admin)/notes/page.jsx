'use client';

import { useMemo, useState } from 'react';
import { CheckCheck, CheckCircle2, ClipboardCheck, PencilLine, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';
import ActionsMenu from '@/components/partage/ActionsMenu';
import InfoBadge from '@/components/ui/InfoBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useModalOperations } from '@/lib/hooks/useModalOperations';

import useNotesAdmin from '@/lib/hooks/useNotesAdmin';
import useCours from '@/lib/hooks/useCours';

const STATUS_CONFIG = {
    brouillon: { label: 'Brouillon', variant: 'gray' },
    soumise: { label: 'Soumise', variant: 'orange' },
    validee: { label: 'Validée', variant: 'green' },
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

function NoteActionsMenu({ note, onValider }) {
    const actions = [
        {
            icon: CheckCircle2,
            label: 'Valider la note',
            onClick: () => onValider?.(note),
        },
    ];

    return <ActionsMenu item={note} actions={actions} />;
}

export default function NotesValidationPage() {
    const [activeTab, setActiveTab] = useState('toutes');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const {
        notes,
        loading,
        error,
        filters,
        counts,
        updateFilter,
        resetServerFilters,
        validerNote,
        validerMasse,
    } = useNotesAdmin({ per_page: 500 });

    const { cours } = useCours({ per_page: 300 });
    const { isSubmitting, handleSimpleOperation } = useModalOperations();

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
            if (activeTab !== 'toutes' && note?.statut !== activeTab) return false;

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
    }, [activeTab, notes, searchQuery]);

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

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSelectedIds([]);
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setSelectedIds([]);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setActiveTab('toutes');
        setSelectedIds([]);
        resetServerFilters();
    };

    const handleFilterChange = (key, value) => {
        if (key === 'cours_id') {
            updateFilter('cours_id', value || null);
            setSelectedIds([]);
        }
    };

    const handleValiderUneNote = async (note) => {
        if (!note?.id || isSubmitting) return;

        await handleSimpleOperation(
            () => validerNote(note.id),
            'Note validée avec succès',
            'Erreur lors de la validation de la note'
        );
        setSelectedIds((prev) => prev.filter((id) => id !== note.id));
    };

    const handleValiderMasse = async () => {
        if (selectedIds.length === 0) {
            toast.error('Sélectionnez au moins une note');
            return;
        }

        const count = selectedIds.length;
        const result = await handleSimpleOperation(
            () => validerMasse(selectedIds),
            `${count} note${count > 1 ? 's' : ''} validée${count > 1 ? 's' : ''} avec succès`,
            'Erreur lors de la validation en masse'
        );

        if (result.success) {
            setSelectedIds([]);
        }
    };

    const tabs = [
        { id: 'toutes', label: 'Toutes', count: counts.total },
        { id: 'soumise', label: 'Soumises', count: counts.soumises },
        { id: 'brouillon', label: 'Brouillons', count: counts.brouillons },
    ];

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
                    <NoteActionsMenu note={row} onValider={handleValiderUneNote} />
                </div>
            ),
        },
    ];

    const selectedFilters = {
        cours_id: filters.cours_id || '',
    };

    const filterOptions = [
        {
            key: 'cours_id',
            placeholder: 'Cours',
            options: coursOptions,
        },
    ];

    const rightAction = (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{selectedIds.length} sélectionnée(s)</span>
            <Button
                size="sm"
                onClick={handleValiderMasse}
                disabled={selectedIds.length === 0 || isSubmitting}
                className="h-8"
            >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                Valider la sélection
            </Button>
        </div>
    );

    return (
        <ListPageLayout
            title="Validation des notes"
            description="Contrôlez les notes soumises ou en brouillon et validez-les pour lancer le recalcul académique."
        >
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
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
                    Impossible de charger les notes en attente: {error.message}
                </div>
            )}

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-800 flex items-start gap-2">
                <PencilLine className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    Le professeur saisit/soumet les notes. L&apos;administrateur vérifie puis valide une note
                    (ou un lot) pour la rendre définitive et déclencher les recalculs.
                </p>
            </div>

            <DataTableSection
                title="Notes en attente de validation"
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
                    <p className="font-medium">Aucune note en attente</p>
                    <p className="text-sm mt-1">Toutes les notes de ce périmètre sont déjà validées.</p>
                </div>
            )}
        </ListPageLayout>
    );
}
