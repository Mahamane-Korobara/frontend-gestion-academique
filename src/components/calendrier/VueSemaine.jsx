import { useMemo, useState, Fragment } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreneauCard from './CreneauCard';
import Legende from '@/components/partage/Legende';
import { JOURS_ORDRE, JOURS_COURTS } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';
import EmptyState from '@/components/partage/EmptyState';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(iso) {
    if (!iso || typeof iso !== 'string') return null;
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);

    return date;
}

function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    next.setHours(0, 0, 0, 0);
    return next;
}

function getMonday(date) {
    const monday = new Date(date);
    const dayIndex = (monday.getDay() + 6) % 7; // Lundi=0 ... Dimanche=6
    monday.setDate(monday.getDate() - dayIndex);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatDateShort(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

function buildTranches(creneaux) {
    const set = new Set(
        (creneaux || [])
            .map((c) => `${c.creneau?.debut}|${c.creneau?.fin}`)
            .filter((t) => !t.includes('undefined'))
    );

    return [...set]
        .sort()
        .map((t) => {
            const [debut, fin] = t.split('|');
            return { debut, fin };
        });
}

function getEvaluationWeekBounds(creneaux) {
    const isoDates = (creneaux || [])
        .map((c) => c?.date || c?.dateIso || c?.date_iso)
        .filter(Boolean)
        .sort();

    if (isoDates.length === 0) return null;

    const minDate = parseIsoDate(isoDates[0]);
    const maxDate = parseIsoDate(isoDates[isoDates.length - 1]);
    if (!minDate || !maxDate) return null;

    const minMonday = getMonday(minDate);
    const maxMonday = getMonday(maxDate);
    const totalWeeks = Math.floor((maxMonday.getTime() - minMonday.getTime()) / (7 * MS_PER_DAY)) + 1;

    return { minMonday, maxMonday, totalWeeks };
}

export default function VueSemaine({ creneaux, onDelete, mode = 'planning' }) {
    const isEvaluationMode = mode === 'evaluation';
    const planningParJour = useMemo(() => groupByJour(creneaux), [creneaux]);
    const planningTranches = useMemo(() => buildTranches(creneaux), [creneaux]);

    const weekBounds = useMemo(() => getEvaluationWeekBounds(creneaux), [creneaux]);
    const [weekOffset, setWeekOffset] = useState(0);

    const safeOffset = weekBounds
        ? Math.min(Math.max(weekOffset, 0), weekBounds.totalWeeks - 1)
        : 0;

    const weekStart = weekBounds ? addDays(weekBounds.minMonday, safeOffset * 7) : null;
    const weekEnd = weekStart ? addDays(weekStart, 5) : null;

    const weekDays = weekStart
        ? JOURS_ORDRE.map((jour, index) => {
              const date = addDays(weekStart, index);
              return {
                  jour,
                  iso: toIsoDate(date),
                  dateLabel: formatDateShort(date),
              };
          })
        : [];

    const weekDaySet = new Set(weekDays.map((d) => d.iso));

    const weekCreneaux = weekDaySet.size === 0
        ? []
        : (creneaux || []).filter((c) => weekDaySet.has(c?.date || c?.dateIso || c?.date_iso));

    const evaluationParJour = groupByJour(weekCreneaux);
    const evaluationTranches = buildTranches(weekCreneaux);

    if (!isEvaluationMode) {
        if (planningTranches.length === 0) return <EmptyState />;

        return (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <div
                    className="min-w-150"
                    style={{ display: 'grid', gridTemplateColumns: `68px repeat(${JOURS_ORDRE.length}, 1fr)` }}
                >
                    <div className="bg-gray-50 border-b border-gray-200 p-3" />
                    {JOURS_ORDRE.map((jour) => (
                        <div key={jour} className="bg-gray-50 border-b border-l border-gray-200 p-2 text-center">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide hidden sm:block">{jour}</p>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide sm:hidden">{JOURS_COURTS[jour]}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {planningParJour[jour].length > 0 ? `${planningParJour[jour].length} cours` : '—'}
                            </p>
                        </div>
                    ))}
                    {planningTranches.map(({ debut, fin }) => (
                        <Fragment key={`${debut}-${fin}`}>
                            <div className="border-b border-gray-100 px-1 py-3 flex flex-col items-center justify-center gap-0.5 bg-gray-50/60">
                                <span className="text-[10px] font-bold text-gray-500">{debut}</span>
                                <span className="text-[8px] text-gray-300">│</span>
                                <span className="text-[10px] font-bold text-gray-500">{fin}</span>
                            </div>
                            {JOURS_ORDRE.map((jour) => {
                                const matches = planningParJour[jour].filter(
                                    (c) => c.creneau?.debut === debut && c.creneau?.fin === fin
                                );

                                return (
                                    <div key={`${jour}-${debut}`} className="border-b border-l border-gray-100 p-1.5 min-h-20 space-y-1">
                                        {matches.map((c) => (
                                            <CreneauCard key={c.id} creneau={c} onDelete={onDelete} />
                                        ))}
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

    if (!weekBounds || !weekStart || !weekEnd) return <EmptyState />;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                <button
                    onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}
                    disabled={safeOffset <= 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">
                        Semaine {safeOffset + 1} / {weekBounds.totalWeeks}
                    </p>
                    <p className="text-xs text-gray-400">
                        Du {formatDateShort(weekStart)} au {formatDateShort(weekEnd)} · {weekCreneaux.length} évaluation{weekCreneaux.length > 1 ? 's' : ''}
                    </p>
                </div>

                <button
                    onClick={() => setWeekOffset((prev) => Math.min(prev + 1, weekBounds.totalWeeks - 1))}
                    disabled={safeOffset >= weekBounds.totalWeeks - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {evaluationTranches.length === 0 ? (
                <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Aucune évaluation planifiée sur cette semaine.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div
                        className="min-w-150"
                        style={{ display: 'grid', gridTemplateColumns: `68px repeat(${JOURS_ORDRE.length}, 1fr)` }}
                    >
                        <div className="bg-gray-50 border-b border-gray-200 p-3" />
                        {weekDays.map(({ jour, dateLabel }) => (
                            <div key={jour} className="bg-gray-50 border-b border-l border-gray-200 p-2 text-center">
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide hidden sm:block">{jour}</p>
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide sm:hidden">{JOURS_COURTS[jour]}</p>
                                <p className="text-[10px] font-medium text-gray-500 mt-0.5">{dateLabel}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {evaluationParJour[jour].length > 0 ? `${evaluationParJour[jour].length} éval.` : '—'}
                                </p>
                            </div>
                        ))}
                        {evaluationTranches.map(({ debut, fin }) => (
                            <Fragment key={`${debut}-${fin}`}>
                                <div className="border-b border-gray-100 px-1 py-3 flex flex-col items-center justify-center gap-0.5 bg-gray-50/60">
                                    <span className="text-[10px] font-bold text-gray-500">{debut}</span>
                                    <span className="text-[8px] text-gray-300">│</span>
                                    <span className="text-[10px] font-bold text-gray-500">{fin}</span>
                                </div>
                                {JOURS_ORDRE.map((jour) => {
                                    const matches = evaluationParJour[jour].filter(
                                        (c) => c.creneau?.debut === debut && c.creneau?.fin === fin
                                    );

                                    return (
                                        <div key={`${jour}-${debut}`} className="border-b border-l border-gray-100 p-1.5 min-h-20 space-y-1">
                                            {matches.map((c) => (
                                                <CreneauCard key={c.id} creneau={c} onDelete={onDelete} />
                                            ))}
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>
                    <Legende />
                </div>
            )}
        </div>
    );
}
