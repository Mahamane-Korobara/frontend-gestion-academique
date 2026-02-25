import { Trash2, BookOpen } from 'lucide-react';
import { TYPE_ICONS } from '@/lib/utils/constants';
import { getProfNom, getStyles } from '@/lib/utils/emploiDuTempsHelpers';

function getDisplayDate(creneau) {
    if (creneau?.dateLabel) return creneau.dateLabel;

    const raw = creneau?.date || creneau?.dateIso || creneau?.date_iso;
    if (!raw || typeof raw !== 'string') return null;

    const part = raw.slice(0, 10);
    const [year, month, day] = part.split('-');
    if (!year || !month || !day) return null;

    return `${day}/${month}/${year}`;
}

export default function CreneauCard({ creneau, onDelete, compact = false }) {
    const styles = getStyles(creneau.type?.color);
    const Icon   = TYPE_ICONS[creneau.type?.code] || BookOpen;
    const canDelete = typeof onDelete === 'function';
    const dateLabel = getDisplayDate(creneau);

    if (compact) {
        return (
            <div className={`rounded-md border px-2 py-1.5 group relative ${styles.card}`}>
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
                        <span className="text-[10px] font-bold text-gray-800 truncate">
                            {creneau.cours?.titre || '—'}
                        </span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(creneau.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-red-500 shrink-0"
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>
                <p className="text-[9px] text-gray-400 truncate pl-2.5">
                    {dateLabel
                        ? `${dateLabel} · ${creneau.creneau?.debut}–${creneau.creneau?.fin}`
                        : `${creneau.creneau?.debut}–${creneau.creneau?.fin}`}
                </p>
            </div>
        );
    }

    return (
        <div className={`rounded-lg border p-2.5 group relative transition-shadow hover:shadow-md ${styles.card}`}>
            <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                    <Icon className="w-2.5 h-2.5" />
                    {creneau.type?.label || creneau.type?.code}
                </span>
                {canDelete && (
                    <button
                        onClick={() => onDelete(creneau.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
            <p className="text-xs font-bold text-gray-800 truncate">{creneau.cours?.titre || '—'}</p>
            <p className="text-[10px] text-gray-500 truncate">{creneau.cours?.code}</p>
            {dateLabel && <p className="text-[10px] text-gray-500 mt-1 truncate">📅 {dateLabel}</p>}
            <p className="text-[10px] text-gray-500 mt-1 truncate">👤 {getProfNom(creneau)}</p>
            {creneau.salle  && <p className="text-[10px] text-gray-400 truncate">🏛️ {creneau.salle.nom}</p>}
            {creneau.niveau && <p className="text-[10px] text-gray-400 truncate">📚 {creneau.niveau.nom}</p>}
        </div>
    );
}
