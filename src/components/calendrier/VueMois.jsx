import { useMemo, useState } from 'react';
import {ChevronLeft, ChevronRight } from 'lucide-react';
import CreneauCard from './CreneauCard';
import Legende from '@/components/partage/Legende';
import { JOURS_ORDRE, JOURS_COURTS } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';
import EmptyState from '@/components/partage/EmptyState';


export default function VueMois({ creneaux, onDelete }) {
    const [semaine, setSemaine] = useState(0);
    const parJour = useMemo(() => groupByJour(creneaux), [creneaux]);
    const totalSemaines   = 4;
    const currentSemaine  = ((semaine % totalSemaines) + totalSemaines) % totalSemaines;
    const joursAvecCours  = JOURS_ORDRE.filter(j => parJour[j].length > 0);

    if (joursAvecCours.length === 0) return <EmptyState />;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                <button onClick={() => setSemaine(s => s - 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">Semaine {currentSemaine + 1} / {totalSemaines}</p>
                    <p className="text-xs text-gray-400">Planning récurrent · {creneaux.length} créneau{creneaux.length > 1 ? 'x' : ''}</p>
                </div>
                <button onClick={() => setSemaine(s => s + 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="min-w-125"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${JOURS_ORDRE.length}, 1fr)` }}
                >
                    {JOURS_ORDRE.map(jour => (
                        <div key={jour} className="bg-gray-50 border-b border-r border-gray-200 p-2 text-center last:border-r-0">
                            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider hidden sm:block">{jour}</p>
                            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider sm:hidden">{JOURS_COURTS[jour]}</p>
                        </div>
                    ))}
                    {JOURS_ORDRE.map(jour => {
                        const list = parJour[jour];
                        return (
                            <div key={jour} className="border-r border-b border-gray-100 p-2 min-h-30 last:border-r-0 space-y-1.5">
                                {list.length === 0
                                    ? <div className="flex items-center justify-center h-full min-h-25"><span className="text-xs text-gray-200">—</span></div>
                                    : list.map(c => <CreneauCard key={c.id} creneau={c} onDelete={onDelete} compact />)
                                }
                            </div>
                        );
                    })}
                </div>
                <Legende />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {JOURS_ORDRE.map(jour => {
                    const count = parJour[jour].length;
                    return (
                        <div key={jour} className={`rounded-lg border p-2.5 text-center ${count > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                            <p className={`text-xs font-bold ${count > 0 ? 'text-blue-700' : 'text-gray-400'}`}>{JOURS_COURTS[jour]}</p>
                            <p className={`text-lg font-black ${count > 0 ? 'text-blue-600' : 'text-gray-200'}`}>{count}</p>
                            <p className="text-[10px] text-gray-400">{count > 0 ? 'cours' : 'libre'}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}