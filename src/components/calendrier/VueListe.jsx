import { useMemo } from 'react';
import { Trash2, BookOpen } from 'lucide-react';
import { JOURS_ORDRE, TYPE_ICONS } from '@/lib/utils/constants';
import { getProfNom, getStyles } from '@/lib/utils/emploiDuTempsHelpers';
import EmptyState from '@/components/partage/EmptyState';

export default function VueListe({ creneaux, onDelete }) {
    const canDelete = typeof onDelete === 'function';
    const parJour = useMemo(() => {
        const map = {};
        creneaux.forEach(c => { if (!map[c.jour]) map[c.jour] = []; map[c.jour].push(c); });
        Object.values(map).forEach(arr => arr.sort((a, b) => (a.creneau?.debut || '').localeCompare(b.creneau?.debut || '')));
        return map;
    }, [creneaux]);

    const joursActifs = JOURS_ORDRE.filter(j => parJour[j]);
    if (joursActifs.length === 0) return <EmptyState />;

    return (
        <div className="space-y-4">
            {joursActifs.map(jour => (
                <div key={jour} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <h3 className="text-sm font-bold text-gray-700">{jour}</h3>
                        <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                            {parJour[jour].length} créneau{parJour[jour].length > 1 ? 'x' : ''}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {parJour[jour].map(c => {
                            const styles = getStyles(c.type?.color);
                            const Icon = TYPE_ICONS[c.type?.code] || BookOpen;
                            return (
                                <div key={c.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                                    <div className="text-center shrink-0 w-12">
                                        <p className="text-[10px] font-bold text-gray-600">{c.creneau?.debut}</p>
                                        <div className="w-px h-3 bg-gray-300 mx-auto my-0.5" />
                                        <p className="text-[10px] text-gray-400">{c.creneau?.fin}</p>
                                    </div>
                                    <div className={`w-1 self-stretch rounded-full shrink-0 ${styles.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                                                <Icon className="w-2.5 h-2.5" />
                                                {c.type?.label}
                                            </span>
                                            {c.niveau && (
                                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                    {c.niveau.nom}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 truncate">{c.cours?.titre}</p>
                                        <p className="text-xs text-gray-500">
                                            {getProfNom(c)}{c.salle ? ` · 🏛️ ${c.salle.nom}` : ''}
                                        </p>
                                    </div>
                                    {canDelete && (
                                        <button onClick={() => onDelete(c.id)}
                                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
