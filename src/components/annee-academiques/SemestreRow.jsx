import { CheckCircle2, Calendar, BookOpen, Power, Pencil, Trash2 } from 'lucide-react';

export default function SemestreRow({ semestre, onEdit, onDelete, onActivate }) {
    const fmt = (d) => d
        ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors">

            {/* Ligne 1 mobile : label + badge + actions (tout inline) */}
            <div className="flex items-center justify-between sm:contents">

                {/* Numéro semestre */}
                <div className="w-auto sm:w-24 shrink-0">
                    <span className="text-sm font-bold text-gray-700">
                        {semestre.numero_label ?? semestre.numero}
                    </span>
                </div>

                {/* Badge + actions — uniquement sur mobile */}
                <div className="flex items-center gap-1.5 sm:hidden">
                    {semestre.is_active
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                            <CheckCircle2 className="w-3 h-3" /> Actif
                          </span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                            Inactif
                          </span>
                    }
                    <div className="flex items-center gap-0.5">
                        {!semestre.is_active && (
                            <button onClick={() => onActivate(semestre)} title="Activer"
                                className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                <Power className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button onClick={() => onEdit(semestre)} title="Modifier"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!semestre.is_active && (
                            <button onClick={() => onDelete(semestre)} title="Supprimer"
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{fmt(semestre.date_debut)} → {fmt(semestre.date_fin)}</span>
                </div>
                {semestre.date_debut_examens && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                            Examens : {fmt(semestre.date_debut_examens)} → {fmt(semestre.date_fin_examens)}
                        </span>
                    </div>
                )}
            </div>

            {/* Badge statut — desktop uniquement */}
            <div className="hidden sm:block shrink-0">
                {semestre.is_active
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                        Inactif
                      </span>
                }
            </div>

            {/* Actions — desktop uniquement */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
                {!semestre.is_active && (
                    <button onClick={() => onActivate(semestre)} title="Activer"
                        className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Power className="w-3.5 h-3.5" />
                    </button>
                )}
                <button onClick={() => onEdit(semestre)} title="Modifier"
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                {!semestre.is_active && (
                    <button onClick={() => onDelete(semestre)} title="Supprimer"
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}