import { useMemo, Fragment } from 'react';
import CreneauCard from './CreneauCard';
import Legende from '@/components/partage/Legende';
import { JOURS_ORDRE, JOURS_COURTS } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';
import EmptyState from '@/components/partage/EmptyState';



export default function VueSemaine({ creneaux, onDelete }) {
    const parJour = useMemo(() => groupByJour(creneaux), [creneaux]);
    const tranches = useMemo(() => {
        const set = new Set(
            creneaux.map(c => `${c.creneau?.debut}|${c.creneau?.fin}`)
                    .filter(t => !t.includes('undefined'))
        );
        return [...set].sort().map(t => { const [debut, fin] = t.split('|'); return { debut, fin }; });
    }, [creneaux]);

    if (tranches.length === 0) return <EmptyState />;

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="min-w-150"
                style={{ display: 'grid', gridTemplateColumns: `68px repeat(${JOURS_ORDRE.length}, 1fr)` }}
            >
                <div className="bg-gray-50 border-b border-gray-200 p-3" />
                {JOURS_ORDRE.map(jour => (
                    <div key={jour} className="bg-gray-50 border-b border-l border-gray-200 p-2 text-center">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide hidden sm:block">{jour}</p>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide sm:hidden">{JOURS_COURTS[jour]}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {parJour[jour].length > 0 ? `${parJour[jour].length} cours` : '—'}
                        </p>
                    </div>
                ))}
                {tranches.map(({ debut, fin }) => (
                    <Fragment key={`${debut}-${fin}`}>
                        <div className="border-b border-gray-100 px-1 py-3 flex flex-col items-center justify-center gap-0.5 bg-gray-50/60">
                            <span className="text-[10px] font-bold text-gray-500">{debut}</span>
                            <span className="text-[8px] text-gray-300">│</span>
                            <span className="text-[10px] font-bold text-gray-500">{fin}</span>
                        </div>
                        {JOURS_ORDRE.map(jour => {
                            const matches = parJour[jour].filter(
                                c => c.creneau?.debut === debut && c.creneau?.fin === fin
                            );
                            return (
                                <div key={`${jour}-${debut}`}
                                    className="border-b border-l border-gray-100 p-1.5 min-h-20 space-y-1"
                                >
                                    {matches.map(c => <CreneauCard key={c.id} creneau={c} onDelete={onDelete} />)}
                                </div>
                            );
                        })}
                    </Fragment>
                ))}
            </div>
            <Legende />
        </div>
    );
}