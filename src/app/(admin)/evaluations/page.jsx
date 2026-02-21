'use client';

import { useState, useMemo } from 'react';
import { Plus, ClipboardList, Calendar, Clock, BookOpen, Award, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import useModal               from '@/lib/hooks/useModal';
import ListPageLayout         from '@/components/partage/ListPageLayout';
import ListPageFilters        from '@/components/partage/ListPageFilters';
import DataTableSection       from '@/components/partage/DataTableSection';
import { useModalOperations } from '@/lib/hooks/useModalOperations';
import ActionsMenu            from '@/components/partage/ActionsMenu';
import InfoBadge              from '@/components/ui/InfoBadge';

import useEvaluations from '@/lib/hooks/useEvaluations';
import useCours       from '@/lib/hooks/useCours';
import EvaluationForm from '@/components/forms/EvaluationForm';

// Constantes
const TYPES_EVALUATIONS = [
    { value: '1', label: 'Contrôle Continu',  coefficient_defaut: 0.40 },
    { value: '2', label: 'Examen Final',       coefficient_defaut: 0.60 },
    { value: '3', label: 'Travaux Pratiques',  coefficient_defaut: 0.30 },
    { value: '4', label: 'Projet',             coefficient_defaut: 0.40 },
    { value: '5', label: 'Rattrapage',         coefficient_defaut: 1.00 },
];

const STATUT_CONFIG = {
    planifiee: { label: 'Planifiée', bg: 'bg-blue-50',   text: 'text-blue-600'   },
    en_cours:  { label: 'En cours',  bg: 'bg-orange-50', text: 'text-orange-600' },
    terminee:  { label: 'Terminée',  bg: 'bg-emerald-50',text: 'text-emerald-600'},
    annulee:   { label: 'Annulée',   bg: 'bg-red-50',    text: 'text-red-500'    },
};

// ─ Sous-composants 
function StatutBadge({ statut }) {
    const cfg = STATUT_CONFIG[statut] ?? { label: statut, bg: 'bg-gray-100', text: 'text-gray-500' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Actions menu évaluation 
function EvaluationActionsMenu({ evaluation, onEdit, onDelete }) {
    const actions = [
        {
            icon: Pencil,
            label: 'Modifier',
            onClick: onEdit,
        },
        { type: 'separator' },
        {
            icon: Trash2,
            label: 'Supprimer',
            onClick: onDelete,
            variant: 'destructive',
        },
    ];

    return <ActionsMenu item={evaluation} actions={actions} />;
}

// ─ Page ─
export default function EvaluationsPage() {
    const [activeTab, setActiveTab]             = useState('toutes');
    const [searchQuery, setSearchQuery]         = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [selectedEval, setSelectedEval]       = useState(null);

    const createModal = useModal();
    const editModal   = useModal();
    const deleteModal = useModal();

    const { evaluations, loading: evalLoading, createEvaluation, updateEvaluation, deleteEvaluation } = useEvaluations();
    const { cours, loading: coursLoading } = useCours();
    const { isSubmitting, validationErrors, handleCreate, handleUpdate, handleDelete } = useModalOperations();

    //  Options dérivées
    const coursOptions = useMemo(() =>
        (cours || []).map(c => ({
            value:       String(c.id),
            label:       `${c.code} — ${c.titre ?? c.nom ?? ''}`,
            semestre_id: c.semestre_id ?? c.semestre?.id,
        })),
    [cours]);

    const semestresOptions = useMemo(() => {
        const seen = new Map();
        (cours || []).forEach(c => {
            const sid = c.semestre_id ?? c.semestre?.id;
            const label = c.semestre
                ? `${c.semestre.numero} — ${c.semestre.annee ?? ''}`
                : `Semestre ${sid}`;
            if (sid && !seen.has(sid)) seen.set(sid, { value: String(sid), label });
        });
        return Array.from(seen.values());
    }, [cours]);

    //  Filtrage ─
    const filtered = useMemo(() => evaluations.filter(ev => {
        if (activeTab !== 'toutes' && ev.statut !== activeTab) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!ev.titre?.toLowerCase().includes(q)
                && !ev.cours?.titre?.toLowerCase().includes(q)
                && !ev.cours?.code?.toLowerCase().includes(q)) return false;
        }
        if (selectedFilters.type_evaluation_id) {
            if (String(ev.type_evaluation?.id) !== String(selectedFilters.type_evaluation_id)) return false;
        }
        return true;
    }), [evaluations, activeTab, searchQuery, selectedFilters]);

    //  Onglets ─
    const countByStatut = (s) => evaluations.filter(e => e.statut === s).length;

    const tabs = [
        { id: 'toutes',    label: 'Toutes',    count: evaluations.length      },
        { id: 'planifiee', label: 'Planifiées', count: countByStatut('planifiee') },
        { id: 'en_cours',  label: 'En cours',   count: countByStatut('en_cours')  },
        { id: 'terminee',  label: 'Terminées',  count: countByStatut('terminee')  },
    ];

    const filterOptions = [{
        key: 'type_evaluation_id',
        placeholder: 'Type',
        options: TYPES_EVALUATIONS.map(t => ({ value: t.value, label: t.label })),
    }];

    const resetFilters    = () => { setSearchQuery(''); setSelectedFilters({}); };
    const handleTabChange = (tab) => { setActiveTab(tab); resetFilters(); };
    const updateFilter    = (key, value) => setSelectedFilters(p => ({ ...p, [key]: value }));

    //  CRUD 
    const handleCreateWrapped = (coursId, data) =>
        handleCreate(createEvaluation.bind(null, coursId), data, createModal, 'Évaluation créée avec succès');

    const handleUpdateWrapped = (_coursId, data) =>
        handleUpdate(updateEvaluation, selectedEval.id, data, editModal,
            'Évaluation modifiée avec succès', () => setSelectedEval(null));

    const handleConfirmDelete = () =>
        handleDelete(deleteEvaluation, selectedEval.id, deleteModal,
            'Évaluation supprimée avec succès', () => setSelectedEval(null));

    const openEdit = (row) => { setSelectedEval(row); editModal.open(); };
    const openDelete = (row) => { setSelectedEval(row); deleteModal.open(); };

    //  Colonnes 
    const columns = [
        {
            key: 'titre',
            label: 'ÉVALUATION',
            className: 'min-w-[220px]',
            render: (_, row) => (
                <div className="flex flex-col min-w-0 py-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">{row.titre}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {row.cours?.code} — {row.cours?.titre}
                    </span>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'TYPE',
            className: 'hidden md:table-cell',
            render: (_, row) => (
                <InfoBadge label={row.type_evaluation?.nom ?? '—'} variant="purple" />
            ),
        },
        {
            key: 'semestre',
            label: 'SEMESTRE',
            className: 'hidden lg:table-cell',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">{row.semestre?.numero}</span>
                    <span className="text-xs text-gray-400">{row.semestre?.annee}</span>
                </div>
            ),
        },
        {
            key: 'date',
            label: 'DATE & HORAIRE',
            className: 'hidden sm:table-cell',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {fmt(row.date_evaluation)}
                    </span>
                    {row.heure_debut && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {fmtTime(row.heure_debut)}{row.heure_fin ? ` → ${fmtTime(row.heure_fin)}` : ''}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'coefficient',
            label: 'COEF.',
            className: 'hidden lg:table-cell w-20',
            render: (_, row) => (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Award className="w-3.5 h-3.5 text-gray-400" /> ×{row.coefficient}
                </span>
            ),
        },
        {
            key: 'statut',
            label: 'STATUT',
            className: 'w-28',
            render: (_, row) => <StatutBadge statut={row.statut} />,
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            className: 'w-[60px]',
            render: (_, row) => (
                <div className="flex justify-end">
                    <EvaluationActionsMenu
                        evaluation={row}
                        onEdit={() => openEdit(row)}
                        onDelete={() => openDelete(row)}
                    />
                </div>
            ),
        },
    ];

    const formCommonProps = {
        coursOptions,
        semestresOptions,
        serverErrors: validationErrors,
        loading:      isSubmitting,
    };

    return (
        <ListPageLayout
            title="Évaluations"
            description="Planifiez et gérez les évaluations par cours et semestre."
            actionButton={
                <Button size="sm" className="shadow-sm" onClick={createModal.open}>
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Nouvelle évaluation</span>
                    <span className="sm:hidden">Ajouter</span>
                </Button>
            }
            createModal={createModal}
            editModal={editModal}
            deleteModal={deleteModal}
            isSubmitting={isSubmitting}
            selectedItem={selectedEval}
            createModalTitle="Créer une évaluation"
            createModalDescription="Définissez les paramètres de la nouvelle évaluation."
            createModalContent={
                <EvaluationForm
                    {...formCommonProps}
                    onSubmit={handleCreateWrapped}
                    onCancel={createModal.close}
                />
            }
            editModalTitle="Modifier l'évaluation"
            editModalDescription="Mettez à jour les informations de l'évaluation."
            editModalContent={
                selectedEval && (
                    <EvaluationForm
                        {...formCommonProps}
                        evaluation={selectedEval}
                        onSubmit={handleUpdateWrapped}
                        onCancel={() => { editModal.close(); setSelectedEval(null); }}
                    />
                )
            }
            deleteModalItemName={selectedEval?.titre}
            onDeleteConfirm={handleConfirmDelete}
        >
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Titre, code cours..."
                filterOptions={filterOptions}
                selectedFilters={selectedFilters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
            />

            <DataTableSection
                title="Liste des évaluations"
                columns={columns}
                data={filtered}
                loading={evalLoading || coursLoading}
                count={filtered.length}
                emptyIcon={<ClipboardList className="w-10 h-10 opacity-30" />}
                emptyMessage="Aucune évaluation trouvée"
                emptyDescription="Créez votre première évaluation avec le bouton ci-dessus."
            />
        </ListPageLayout>
    );
}