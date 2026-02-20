import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Power, Archive, Pencil, Trash2 } from 'lucide-react';
import AnneeStatusBadge from '@/components/ui/AnneeStatusBadge';
import SemestreRow from './SemestreRow';

export default function AnneeCard({
    annee, onEdit, onDelete, onActivate, onClose,
    onAddSemestre, onEditSemestre, onDeleteSemestre, onActivateSemestre,
}) {
    const [open, setOpen] = useState(annee.is_active);
    const semestres = annee.semestres ?? [];

    return (
        <div className={`rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-sm ${
            annee.is_active ? 'border-blue-200 shadow-sm' : 'border-gray-200'
        }`}>
            {/* En-tête */}
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4">

                <button
                    onClick={() => setOpen(p => !p)}
                    className="mt-0.5 sm:mt-0 shrink-0 p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                >
                    {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-sm font-bold text-gray-800">{annee.annee}</span>
                        <AnneeStatusBadge annee={annee} />
                        <span className="text-xs text-gray-400">
                            {semestres.length} semestre{semestres.length !== 1 ? 's' : ''}
                        </span>
                        {annee.etudiants_count != null && (
                            <span className="text-xs text-gray-400">
                                · {annee.etudiants_count} étudiant{annee.etudiants_count !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {annee.date_debut} → {annee.date_fin}
                    </p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    {!annee.is_cloturee && semestres.length < 2 && (
                        <button onClick={() => onAddSemestre(annee)} title="Ajouter un semestre"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!annee.is_active && !annee.is_cloturee && (
                        <button onClick={() => onActivate(annee)} title="Activer"
                            className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <Power className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {annee.is_active && !annee.is_cloturee && (
                        <button onClick={() => onClose(annee)} title="Clôturer"
                            className="p-1.5 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                            <Archive className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!annee.is_cloturee && (
                        <button onClick={() => onEdit(annee)} title="Modifier"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!annee.is_active && !annee.is_cloturee && (
                        <button onClick={() => onDelete(annee)} title="Supprimer"
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Corps accordéon */}
            {open && (
                <div className="px-3 sm:px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
                    {semestres.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-3">
                            Aucun semestre défini.{' '}
                            {!annee.is_cloturee && (
                                <button
                                    onClick={() => onAddSemestre(annee)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Ajouter un semestre
                                </button>
                            )}
                        </p>
                    ) : semestres.map(s => (
                        <SemestreRow
                            key={s.id}
                            semestre={s}
                            onEdit={onEditSemestre}
                            onDelete={onDeleteSemestre}
                            onActivate={onActivateSemestre}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
