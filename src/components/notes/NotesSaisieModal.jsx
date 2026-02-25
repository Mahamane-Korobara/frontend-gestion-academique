'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/partage/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import StatusBadge from '@/components/ui/StatusBadge';

function formatDate(value) {
    if (!value) return '—';
    const part = String(value).slice(0, 10);
    const [year, month, day] = part.split('-');
    if (!year || !month || !day) return part;
    return `${day}/${month}/${year}`;
}

function parseRowErrors(errors = {}) {
    const parsed = {};

    Object.entries(errors || {}).forEach(([key, messages]) => {
        const match = /^notes\.(\d+)\.(note|commentaire|is_absent)$/.exec(key);
        if (!match) return;

        const index = Number(match[1]);
        const field = match[2];

        if (!parsed[index]) parsed[index] = {};
        parsed[index][field] = Array.isArray(messages) ? messages[0] : String(messages);
    });

    return parsed;
}

export default function NotesSaisieModal({
    isOpen,
    onClose,
    details,
    loading = false,
    saving = false,
    rowErrors = {},
    rows = [],
    onRowsChange,
    onSave,
}) {
    const parsedErrors = useMemo(() => parseRowErrors(rowErrors), [rowErrors]);

    const resume = details?.resume || {};
    const evaluation = details?.evaluation || null;

    const editableRowsCount = useMemo(
        () => rows.filter((row) => !row.locked).length,
        [rows]
    );

    const handleFieldChange = (index, key, value) => {
        onRowsChange?.((prev) =>
            (prev || []).map((row, rowIndex) => {
                if (rowIndex !== index || row.locked) return row;

                if (key === 'is_absent') {
                    return {
                        ...row,
                        is_absent: Boolean(value),
                        note: value ? '' : row.note,
                    };
                }

                return { ...row, [key]: value };
            })
        );
    };

    const handleSave = async (soumettre) => {
        if (typeof onSave !== 'function') return;
        await onSave({ rows, soumettre });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={evaluation ? `Saisie des notes - ${evaluation.titre}` : 'Saisie des notes'}
            description="Renseignez les notes des étudiants inscrits à cette évaluation."
            size="3xl"
            closeOnOverlayClick={!saving}
            showCloseButton={!saving}
        >
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : !evaluation ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Impossible de charger les données de cette évaluation.
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-semibold text-gray-700">Cours:</span> {evaluation?.cours?.code} — {evaluation?.cours?.titre}</p>
                            <p><span className="font-semibold text-gray-700">Type:</span> {evaluation?.type_evaluation?.nom || '—'}</p>
                            <p><span className="font-semibold text-gray-700">Date:</span> {formatDate(evaluation?.date_evaluation)}</p>
                            <p><span className="font-semibold text-gray-700">Semestre:</span> {evaluation?.semestre?.numero || '—'} {evaluation?.semestre?.annee ? `(${evaluation.semestre.annee})` : ''}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <StatusBadge status={`Total: ${resume.total ?? 0}`} variant="info" />
                            <StatusBadge status={`Saisies: ${resume.notes_saisies ?? 0}`} variant="warning" />
                            <StatusBadge status={`Validées: ${resume.notes_validees ?? 0}`} variant="success" />
                            <StatusBadge status={`Absents: ${resume.absents ?? 0}`} variant="default" />
                            <StatusBadge status={`Éditables: ${editableRowsCount}`} variant="info" />
                        </div>
                    </div>

                    {rows.length === 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            Aucun étudiant inscrit à ce cours.
                        </div>
                    ) : (
                        <>
                            {/* Vue Tableau - Desktop */}
                            <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden">
                                <div className="max-h-[52vh] overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-semibold text-gray-700">Étudiant</th>
                                                <th className="text-left px-3 py-2 font-semibold text-gray-700 w-27.5">Note /20</th>
                                                <th className="text-left px-3 py-2 font-semibold text-gray-700 w-22.5">Absent</th>
                                                <th className="text-left px-3 py-2 font-semibold text-gray-700">Commentaire</th>
                                                <th className="text-left px-3 py-2 font-semibold text-gray-700 w-27.5">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => {
                                                const rowError = parsedErrors[index] || {};
                                                const isLocked = row.locked;

                                                return (
                                                    <tr key={row.etudiant_id} className="border-b border-gray-100 align-top">
                                                        <td className="px-3 py-2">
                                                            <p className="font-semibold text-gray-800">{row.nom_complet}</p>
                                                            <p className="text-xs text-gray-500">{row.matricule}</p>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={20}
                                                                step="0.01"
                                                                value={row.note ?? ''}
                                                                onChange={(e) => handleFieldChange(index, 'note', e.target.value)}
                                                                disabled={isLocked || row.is_absent || saving}
                                                                placeholder="0-20"
                                                            />
                                                            {rowError.note && (
                                                                <p className="mt-1 text-[11px] text-red-600">{rowError.note}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="h-9 flex items-center">
                                                                <Checkbox
                                                                    checked={row.is_absent}
                                                                    disabled={isLocked || saving}
                                                                    onCheckedChange={(checked) =>
                                                                        handleFieldChange(index, 'is_absent', checked === true)
                                                                    }
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={row.commentaire ?? ''}
                                                                onChange={(e) => handleFieldChange(index, 'commentaire', e.target.value)}
                                                                disabled={isLocked || saving}
                                                                placeholder="Commentaire (optionnel)"
                                                            />
                                                            {rowError.commentaire && (
                                                                <p className="mt-1 text-[11px] text-red-600">{rowError.commentaire}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {isLocked ? (
                                                                <StatusBadge status="Validée" variant="success" />
                                                            ) : (
                                                                <StatusBadge status="Éditable" variant="warning" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Vue Cartes - Mobile */}
                            <div className="md:hidden space-y-3 max-h-[60vh] overflow-auto">
                                {rows.map((row, index) => {
                                    const rowError = parsedErrors[index] || {};
                                    const isLocked = row.locked;

                                    return (
                                        <div key={row.etudiant_id} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{row.nom_complet}</p>
                                                <p className="text-xs text-gray-500">{row.matricule}</p>
                                                <div className="mt-2">
                                                    {isLocked ? (
                                                        <StatusBadge status="Validée" variant="success" />
                                                    ) : (
                                                        <StatusBadge status="Éditable" variant="warning" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Note /20</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={20}
                                                        step="0.01"
                                                        value={row.note ?? ''}
                                                        onChange={(e) => handleFieldChange(index, 'note', e.target.value)}
                                                        disabled={isLocked || row.is_absent || saving}
                                                        placeholder="0-20"
                                                        className="w-full"
                                                    />
                                                    {rowError.note && (
                                                        <p className="mt-1 text-[11px] text-red-600">{rowError.note}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`absent-${row.etudiant_id}`}
                                                        checked={row.is_absent}
                                                        disabled={isLocked || saving}
                                                        onCheckedChange={(checked) =>
                                                            handleFieldChange(index, 'is_absent', checked === true)
                                                        }
                                                    />
                                                    <label htmlFor={`absent-${row.etudiant_id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                                        Absent
                                                    </label>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Commentaire (optionnel)</label>
                                                    <Input
                                                        value={row.commentaire ?? ''}
                                                        onChange={(e) => handleFieldChange(index, 'commentaire', e.target.value)}
                                                        disabled={isLocked || saving}
                                                        placeholder="Ajouter un commentaire..."
                                                        className="w-full"
                                                    />
                                                    {rowError.commentaire && (
                                                        <p className="mt-1 text-[11px] text-red-600">{rowError.commentaire}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {editableRowsCount === 0 && rows.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="inline-flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Toutes les notes sont validées. Aucune modification possible.
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSave(false)}
                            disabled={saving || rows.length === 0 || editableRowsCount === 0}
                            className="w-full sm:w-auto"
                        >
                            Enregistrer brouillon
                        </Button>
                        <Button
                            onClick={() => handleSave(true)}
                            disabled={saving || rows.length === 0 || editableRowsCount === 0}
                            className="w-full sm:w-auto"
                        >
                            {saving ? 'Envoi...' : 'Soumettre'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
