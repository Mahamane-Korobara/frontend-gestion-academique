'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';
import NotesSaisieModal from '@/components/notes/NotesSaisieModal';
import useModal from '@/lib/hooks/useModal';
import useNotesProfesseur from '@/lib/hooks/useNotesProfesseur';

function getProgressPercent(saisies, total) {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((Number(saisies || 0) / Number(total)) * 100));
}

export default function NotesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [rows, setRows] = useState([]);

    const notesModal = useModal(false);

    const {
        evaluations,
        evaluationsLoading,
        selectedEvaluationDetails,
        detailsLoading,
        saving,
        rowErrors,
        loadEvaluationDetails,
        saveNotes,
        resetSelection,
    } = useNotesProfesseur();

    const filteredData = useMemo(() => {
        const searchLower = searchQuery.trim().toLowerCase();

        return (evaluations || []).filter((evaluation) => {
            const matchSearch =
                searchLower.length === 0 ||
                evaluation.libelle?.toLowerCase().includes(searchLower) ||
                evaluation.type?.toLowerCase().includes(searchLower) ||
                evaluation.cours?.titre?.toLowerCase().includes(searchLower) ||
                evaluation.cours?.code?.toLowerCase().includes(searchLower);

            if (!matchSearch) return false;

            if (activeTab === 'en_cours') return evaluation.etat_notes === 'en_cours';
            if (activeTab === 'validees') return evaluation.etat_notes === 'validee';
            return true;
        });
    }, [evaluations, searchQuery, activeTab]);

    // Transform etudiants from details into rows
    useMemo(() => {
        if (selectedEvaluationDetails?.etudiants) {
            setRows(selectedEvaluationDetails.etudiants);
        }
    }, [selectedEvaluationDetails?.etudiants]);

    const counts = useMemo(() => {
        const all = evaluations.length;
        const enCours = evaluations.filter((e) => e.etat_notes === 'en_cours').length;
        const validees = evaluations.filter((e) => e.etat_notes === 'validee').length;
        return { all, enCours, validees };
    }, [evaluations]);

    const openNotesModal = async (evaluationId) => {
        notesModal.open();
        try {
            await loadEvaluationDetails(evaluationId);
        } catch (error) {
            toast.error(error?.message || 'Impossible de charger la grille de notes');
        }
    };

    const closeNotesModal = () => {
        notesModal.close();
        resetSelection();
    };

    const handleSaveNotes = async ({ rows, soumettre }) => {
        try {
            await saveNotes({ rows, soumettre });
            if (soumettre) {
                notesModal.close();
                resetSelection();
            }
        } catch {
            // erreurs déjà gérées dans le hook (toast + rowErrors)
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
    };

    const columns = [
        {
            key: 'eval-titre',
            label: 'ÉVALUATION',
            className: 'min-w-[280px]',
            render: (_, row) => (
                <div className="flex items-start gap-3 py-2">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
                        <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-800 truncate">
                            {row.libelle}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                            {row.cours?.code} — {row.cours?.titre}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'eval-type',
            label: 'TYPE',
            className: 'min-w-[140px] hidden md:table-cell',
            render: (_, row) => (
                <InfoBadge label={row.type} variant="blue" />
            ),
        },
        {
            key: 'eval-notes',
            label: 'NOTES SAISIES',
            className: 'min-w-[170px] hidden sm:table-cell',
            render: (_, row) => {
                const progress = getProgressPercent(row.nb_notes_saisies, row.nb_notes_totales);
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                            {row.nb_notes_saisies}/{row.nb_notes_totales}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'eval-statut',
            label: 'STATUT',
            className: 'min-w-[110px] hidden sm:table-cell',
            render: (_, row) => (
                <StatusBadge
                    status={row.etat_notes === 'validee' ? 'Validée' : 'En cours'}
                    variant={row.etat_notes === 'validee' ? 'success' : 'warning'}
                />
            ),
        },
        {
            key: 'eval-actions',
            label: 'ACTIONS',
            className: 'w-[130px]',
            render: (_, row) => (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openNotesModal(row.id)}
                    >
                        Saisir
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <ListPageLayout
                title="Gestion des notes"
                description="Saisissez et soumettez les notes de vos évaluations."
            >
                <ListPageFilters
                    tabs={[
                        { id: 'all', label: 'Toutes', count: counts.all },
                        { id: 'en_cours', label: 'En cours', count: counts.enCours },
                        { id: 'validees', label: 'Validées', count: counts.validees },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Rechercher par évaluation, type ou cours..."
                    onReset={resetFilters}
                />

                <div className="mt-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-amber-900">
                        Les notes validées ne sont plus modifiables par le professeur.
                    </p>
                </div>

                <DataTableSection
                    title="Évaluations à noter"
                    columns={columns}
                    data={filteredData}
                    loading={evaluationsLoading}
                    count={filteredData.length}
                />
            </ListPageLayout>

            <NotesSaisieModal
                isOpen={notesModal.isOpen}
                onClose={closeNotesModal}
                details={selectedEvaluationDetails}
                loading={detailsLoading}
                saving={saving}
                rowErrors={rowErrors}
                rows={rows}
                onRowsChange={setRows}
                onSave={handleSaveNotes}
            />
        </>
    );
}
