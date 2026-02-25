'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, ClipboardList, LayoutGrid, List, Pencil } from 'lucide-react';
import ListPageFilters from '@/components/partage/ListPageFilters';
import VueSemaine from './VueSemaine';
import VueMois from './VueMois';
import VueListe from './VueListe';
import Modal from '@/components/partage/Modal';
import useModal from '@/lib/hooks/useModal';
import { useModalOperations } from '@/lib/hooks/useModalOperations';
import EvaluationForm from '@/components/forms/EvaluationForm';
import { Button } from '@/components/ui/button';
import { JOURS_ORDRE } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';

const VUES = [
    { key: 'semaine', label: 'Semaine', Icon: LayoutGrid },
    { key: 'mois', label: 'Mois', Icon: CalendarDays },
    { key: 'liste', label: 'Liste', Icon: List },
];

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const typeStyleFromEvaluation = (typeEvaluation) => {
    const id = Number(typeEvaluation?.id);
    const nom = typeEvaluation?.nom || 'Évaluation';

    if (id === 2 || id === 5) {
        return { code: 'examen', label: nom, color: 'red' };
    }
    if (id === 3) {
        return { code: 'tp', label: nom, color: 'purple' };
    }
    if (id === 4) {
        return { code: 'td', label: nom, color: 'green' };
    }
    return { code: 'cours', label: nom, color: 'blue' };
};

const parseEvaluationDate = (dateValue) => {
    if (!dateValue) {
        return { isValid: false, reason: 'missing', dayName: null };
    }

    const raw = String(dateValue);
    const datePart = raw.slice(0, 10); // YYYY-MM-DD
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

    if (!match) {
        return { isValid: false, reason: 'invalid', dayName: null };
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return { isValid: false, reason: 'invalid', dayName: null };
    }

    const dateUtc = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(dateUtc.getTime())) {
        return { isValid: false, reason: 'invalid', dayName: null };
    }

    return { isValid: true, reason: null, dayName: JOURS[dateUtc.getUTCDay()] || null };
};

const toHeure = (value, fallback) => {
    if (!value || typeof value !== 'string') return fallback;

    if (value.includes('T')) {
        return value.slice(11, 16);
    }

    if (value.includes(' ')) {
        const part = value.split(' ')[1] || '';
        return part.slice(0, 5) || fallback;
    }

    return value.slice(0, 5) || fallback;
};

const formatDateFr = (dateValue) => {
    if (!dateValue) return '—';
    const part = String(dateValue).slice(0, 10);
    const [year, month, day] = part.split('-');
    if (!year || !month || !day) return part;
    return `${day}/${month}/${year}`;
};

export default function CalendrierEvaluationsSection({
    evaluations = [],
    loading = false,
    filters = {},
    filieresOptions = [],
    niveauxOptions = [],
    semestresOptions = [],
    coursOptions = [],
    typeOptions = [],
    statutOptions = [],
    coursById = new Map(),
    coursOptionsForEdit = [],
    semestresOptionsForEdit = [],
    allowDateCorrection = true,
    onUpdateEvaluation,
    onFiltreFiliere,
    onFiltreNiveau,
    onFiltreSemestre,
    onFiltreCours,
    onFiltreType,
    onFiltreStatut,
}) {
    const [vue, setVue] = useState('semaine');
    const [selectedSundayEvaluation, setSelectedSundayEvaluation] = useState(null);
    const sundayListModal = useModal();
    const editSundayModal = useModal();
    const { isSubmitting, validationErrors, handleUpdate } = useModalOperations();

    const evaluationsFiltrees = useMemo(() => {
        return (evaluations || []).filter((ev) => {
            const coursDetail = coursById.get(String(ev.cours?.id));
            const filiereId = coursDetail?.niveau?.filiere?.id ?? coursDetail?.filiere_id ?? null;
            const niveauId = coursDetail?.niveau?.id ?? coursDetail?.niveau_id ?? null;

            if (filters.filiere_id && String(filiereId) !== String(filters.filiere_id)) return false;
            if (filters.niveau_id && String(niveauId) !== String(filters.niveau_id)) return false;
            if (filters.semestre_id && String(ev.semestre?.id) !== String(filters.semestre_id)) return false;
            if (filters.cours_id && String(ev.cours?.id) !== String(filters.cours_id)) return false;
            if (filters.type_evaluation_id && String(ev.type_evaluation?.id) !== String(filters.type_evaluation_id)) return false;
            if (filters.statut && String(ev.statut) !== String(filters.statut)) return false;

            return true;
        });
    }, [coursById, evaluations, filters]);

    const mappedEvaluations = useMemo(() => {
        return evaluationsFiltrees.map((ev) => {
            const coursDetail = coursById.get(String(ev.cours?.id));
            const parsedDate = parseEvaluationDate(ev.date_evaluation);
            const dayName = parsedDate.dayName;
            const canDisplay = parsedDate.isValid && dayName && JOURS_ORDRE.includes(dayName);
            const evaluationDateIso = String(ev.date_evaluation || '').slice(0, 10);

            return {
                canDisplay,
                parsedDate,
                evaluation: ev,
                creneau: canDisplay
                    ? {
                          id: `evaluation-${ev.id}`,
                          jour: dayName,
                          creneau: {
                              debut: toHeure(ev.heure_debut, '08:00'),
                              fin: toHeure(ev.heure_fin, '10:00'),
                          },
                          type: typeStyleFromEvaluation(ev.type_evaluation),
                          cours: {
                              id: ev.cours?.id,
                              titre: ev.cours?.titre || ev.titre,
                              code: ev.cours?.code || '—',
                          },
                          date: evaluationDateIso,
                          dateLabel: formatDateFr(ev.date_evaluation),
                          niveau: coursDetail?.niveau
                              ? { id: coursDetail.niveau.id, nom: coursDetail.niveau.nom }
                              : null,
                          salle: ev.salle || null,
                          professeur: null,
                      }
                    : null,
            };
        });
    }, [coursById, evaluationsFiltrees]);

    const creneaux = useMemo(
        () => mappedEvaluations.map((item) => item.creneau).filter(Boolean),
        [mappedEvaluations]
    );

    const ignoredStats = useMemo(() => {
        return mappedEvaluations.reduce(
            (acc, item) => {
                if (item.canDisplay) return acc;

                if (item.parsedDate.reason === 'missing' || item.parsedDate.reason === 'invalid') {
                    acc.invalidOrMissing += 1;
                    return acc;
                }

                if (item.parsedDate.dayName === 'Dimanche') {
                    acc.sunday += 1;
                    return acc;
                }

                acc.invalidOrMissing += 1;
                return acc;
            },
            { invalidOrMissing: 0, sunday: 0 }
        );
    }, [mappedEvaluations]);

    const nonPlanifieesCount = ignoredStats.invalidOrMissing + ignoredStats.sunday;

    const sundayEvaluations = useMemo(
        () =>
            mappedEvaluations
                .filter(
                    (item) =>
                        !item.canDisplay &&
                        item.parsedDate.isValid &&
                        item.parsedDate.dayName === 'Dimanche'
                )
                .map((item) => item.evaluation),
        [mappedEvaluations]
    );

    const stats = useMemo(() => {
        const parJour = groupByJour(creneaux);
        return {
            total: creneaux.length,
            jours: JOURS_ORDRE.filter((jour) => (parJour[jour] || []).length > 0).length,
        };
    }, [creneaux]);

    const filterOptions = useMemo(() => {
        const options = [];

        if (filieresOptions.length > 0) {
            options.push({
                key: 'filiere_id',
                label: 'Filière',
                options: filieresOptions,
                width: '180px',
            });
        }

        if (niveauxOptions.length > 0) {
            options.push({
                key: 'niveau_id',
                label: 'Niveau',
                options: niveauxOptions,
                width: '180px',
            });
        }

        if (semestresOptions.length > 0) {
            options.push({
                key: 'semestre_id',
                label: 'Semestre',
                options: semestresOptions,
                width: '190px',
            });
        }

        if (coursOptions.length > 0) {
            options.push({
                key: 'cours_id',
                label: 'Cours',
                options: coursOptions,
                width: '240px',
            });
        }

        if (typeOptions.length > 0) {
            options.push({
                key: 'type_evaluation_id',
                label: 'Type',
                options: typeOptions,
                width: '190px',
            });
        }

        if (statutOptions.length > 0) {
            options.push({
                key: 'statut',
                label: 'Statut',
                options: statutOptions,
                width: '170px',
            });
        }

        return options;
    }, [coursOptions, filieresOptions, niveauxOptions, semestresOptions, statutOptions, typeOptions]);

    const handleFilterChange = (key, value) => {
        const val = value || null;
        if (key === 'filiere_id') onFiltreFiliere?.(val);
        if (key === 'niveau_id') onFiltreNiveau?.(val);
        if (key === 'semestre_id') onFiltreSemestre?.(val);
        if (key === 'cours_id') onFiltreCours?.(val);
        if (key === 'type_evaluation_id') onFiltreType?.(val);
        if (key === 'statut') onFiltreStatut?.(val);
    };

    const handleReset = () => {
        onFiltreFiliere?.(null);
        onFiltreNiveau?.(null);
        onFiltreSemestre?.(null);
        onFiltreCours?.(null);
        onFiltreType?.(null);
        onFiltreStatut?.(null);
    };

    const openEditSundayEvaluation = (evaluation) => {
        if (!allowDateCorrection) return;
        setSelectedSundayEvaluation(evaluation);
        sundayListModal.close();
        editSundayModal.open();
    };

    const handleSundayEvaluationUpdate = async (_coursId, data) => {
        if (!allowDateCorrection || !selectedSundayEvaluation || typeof onUpdateEvaluation !== 'function') return;

        await handleUpdate(
            onUpdateEvaluation,
            selectedSundayEvaluation.id,
            data,
            editSundayModal,
            'Évaluation modifiée avec succès',
            () => setSelectedSundayEvaluation(null)
        );
    };

    return (
        <div className="space-y-4">
            <ListPageFilters
                hideSearch={true}
                inline={true}
                stats={stats}
                statsPrimaryLabel="évaluation"
                statsSecondaryLabel="jours"
                filterOptions={filterOptions}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                showResetButton={true}
                onReset={handleReset}
            />

            {nonPlanifieesCount > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-amber-800">
                            {nonPlanifieesCount} évaluation{nonPlanifieesCount > 1 ? 's' : ''} non affichée{nonPlanifieesCount > 1 ? 's' : ''} :
                            {ignoredStats.sunday > 0 ? ` ${ignoredStats.sunday} le dimanche (calendrier Lundi-Samedi).` : ''}
                            {ignoredStats.invalidOrMissing > 0 ? ` ${ignoredStats.invalidOrMissing} avec date absente/invalide.` : ''}
                        </p>

                        {allowDateCorrection && ignoredStats.sunday > 0 && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-amber-300 text-amber-900 hover:bg-amber-100"
                                onClick={sundayListModal.open}
                            >
                                Corriger les dates du dimanche
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5 shadow-inner">
                    {VUES.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => setVue(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                vue === key
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-9 h-9 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-500">Mise à jour du calendrier des évaluations...</p>
                    </div>
                </div>
            ) : creneaux.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-200">
                    <ClipboardList className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Aucune évaluation planifiée pour ce filtre</p>
                    <p className="text-xs text-gray-300">
                        {allowDateCorrection
                            ? 'Modifiez les filtres ou créez des évaluations'
                            : 'Modifiez les filtres pour afficher vos évaluations'}
                    </p>
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    {vue === 'semaine' && <VueSemaine creneaux={creneaux} mode="evaluation" />}
                    {vue === 'mois' && <VueMois creneaux={creneaux} mode="evaluation" />}
                    {vue === 'liste' && <VueListe creneaux={creneaux} mode="evaluation" />}
                </div>
            )}

            {allowDateCorrection && (
                <>
                    <Modal
                        isOpen={sundayListModal.isOpen}
                        onClose={sundayListModal.close}
                        title="Évaluations planifiées le dimanche"
                        description="Ces évaluations ne s'affichent pas dans ce calendrier (Lundi à Samedi). Corrigez leur date."
                        size="2xl"
                    >
                        <div className="space-y-3">
                            {sundayEvaluations.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                    Aucune évaluation du dimanche trouvée.
                                </div>
                            ) : (
                                sundayEvaluations.map((evaluation) => (
                                    <div
                                        key={evaluation.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {evaluation.titre}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {evaluation.cours?.code} — {evaluation.cours?.titre}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Date actuelle: <span className="font-medium text-amber-700">{formatDateFr(evaluation.date_evaluation)}</span> (dimanche)
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => openEditSundayEvaluation(evaluation)}
                                                className="shrink-0"
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Modifier
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal>

                    <Modal
                        isOpen={editSundayModal.isOpen}
                        onClose={() => {
                            editSundayModal.close();
                            setSelectedSundayEvaluation(null);
                        }}
                        title="Corriger la date de l'évaluation"
                        description="Modifiez les informations ci-dessous. Le formulaire est pré-rempli."
                        size="2xl"
                        closeOnOverlayClick={!isSubmitting}
                        showCloseButton={!isSubmitting}
                    >
                        {selectedSundayEvaluation ? (
                            <EvaluationForm
                                evaluation={selectedSundayEvaluation}
                                coursOptions={coursOptionsForEdit}
                                semestresOptions={semestresOptionsForEdit}
                                serverErrors={validationErrors}
                                loading={isSubmitting}
                                onSubmit={handleSundayEvaluationUpdate}
                                onCancel={() => {
                                    editSundayModal.close();
                                    setSelectedSundayEvaluation(null);
                                }}
                            />
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                                <div className="inline-flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    Aucune évaluation sélectionnée.
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}
