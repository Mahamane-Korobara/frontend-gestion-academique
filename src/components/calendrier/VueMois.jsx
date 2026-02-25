import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreneauCard from './CreneauCard';
import Legende from '@/components/partage/Legende';
import { JOURS_ORDRE, JOURS_COURTS } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';
import EmptyState from '@/components/partage/EmptyState';

const MONTHS_FR = [
    'janvier',
    'fevrier',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'aout',
    'septembre',
    'octobre',
    'novembre',
    'decembre',
];

const DAYS_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

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

function addMonths(date, months) {
    const next = new Date(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + months);
    next.setHours(0, 0, 0, 0);
    return next;
}

function startOfWeekMonday(date) {
    const start = new Date(date);
    const dayIndex = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayIndex);
    start.setHours(0, 0, 0, 0);
    return start;
}

function endOfWeekSunday(date) {
    const end = new Date(date);
    const dayIndex = (end.getDay() + 6) % 7;
    end.setDate(end.getDate() + (6 - dayIndex));
    end.setHours(0, 0, 0, 0);
    return end;
}

function formatMonthYear(date) {
    return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

function getMonthBounds(creneaux) {
    const isoDates = (creneaux || [])
        .map((c) => c?.date || c?.dateIso || c?.date_iso)
        .filter(Boolean)
        .sort();

    if (isoDates.length === 0) return null;

    const minDate = parseIsoDate(isoDates[0]);
    const maxDate = parseIsoDate(isoDates[isoDates.length - 1]);
    if (!minDate || !maxDate) return null;

    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    const totalMonths =
        (maxMonth.getFullYear() - minMonth.getFullYear()) * 12 +
        (maxMonth.getMonth() - minMonth.getMonth()) +
        1;

    return { minMonth, maxMonth, totalMonths };
}

function sortByCreneau(items = []) {
    return [...items].sort((a, b) => (a.creneau?.debut || '').localeCompare(b.creneau?.debut || ''));
}

export default function VueMois({ creneaux, onDelete, mode = 'planning' }) {
    const isEvaluationMode = mode === 'evaluation';

    const [semaine, setSemaine] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

    const planningParJour = useMemo(() => groupByJour(creneaux), [creneaux]);
    const planningJoursAvecCours = useMemo(
        () => JOURS_ORDRE.filter((j) => planningParJour[j].length > 0),
        [planningParJour]
    );

    const monthBounds = useMemo(() => getMonthBounds(creneaux), [creneaux]);
    const safeMonthOffset = monthBounds
        ? Math.min(Math.max(monthOffset, 0), monthBounds.totalMonths - 1)
        : 0;

    const currentMonth = monthBounds ? addMonths(monthBounds.minMonth, safeMonthOffset) : null;

    const creneauxParDate = useMemo(() => {
        const map = new Map();

        (creneaux || []).forEach((c) => {
            const iso = c?.date || c?.dateIso || c?.date_iso;
            if (!iso) return;

            const key = String(iso).slice(0, 10);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(c);
        });

        Array.from(map.keys()).forEach((key) => {
            map.set(key, sortByCreneau(map.get(key)));
        });

        return map;
    }, [creneaux]);

    const monthCells = useMemo(() => {
        if (!currentMonth) return [];

        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const gridStart = startOfWeekMonday(monthStart);
        const gridEnd = endOfWeekSunday(monthEnd);

        const cells = [];
        for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
            cells.push({
                date: new Date(cursor),
                iso: toIsoDate(cursor),
                isCurrentMonth: cursor.getMonth() === currentMonth.getMonth(),
            });
        }

        return cells;
    }, [currentMonth]);

    if (!isEvaluationMode) {
        const totalSemaines = 4;
        const currentSemaine = ((semaine % totalSemaines) + totalSemaines) % totalSemaines;

        if (planningJoursAvecCours.length === 0) return <EmptyState />;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                    <button
                        onClick={() => setSemaine((s) => s - 1)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">
                            Semaine {currentSemaine + 1} / {totalSemaines}
                        </p>
                        <p className="text-xs text-gray-400">
                            Planning récurrent · {creneaux.length} créneau{creneaux.length > 1 ? 'x' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setSemaine((s) => s + 1)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div
                        className="min-w-125"
                        style={{ display: 'grid', gridTemplateColumns: `repeat(${JOURS_ORDRE.length}, 1fr)` }}
                    >
                        {JOURS_ORDRE.map((jour) => (
                            <div key={jour} className="bg-gray-50 border-b border-r border-gray-200 p-2 text-center last:border-r-0">
                                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider hidden sm:block">{jour}</p>
                                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider sm:hidden">{JOURS_COURTS[jour]}</p>
                            </div>
                        ))}
                        {JOURS_ORDRE.map((jour) => {
                            const list = planningParJour[jour];
                            return (
                                <div key={jour} className="border-r border-b border-gray-100 p-2 min-h-30 last:border-r-0 space-y-1.5">
                                    {list.length === 0 ? (
                                        <div className="flex items-center justify-center h-full min-h-25">
                                            <span className="text-xs text-gray-200">—</span>
                                        </div>
                                    ) : (
                                        list.map((c) => <CreneauCard key={c.id} creneau={c} onDelete={onDelete} compact />)
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Legende />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {JOURS_ORDRE.map((jour) => {
                        const count = planningParJour[jour].length;
                        return (
                            <div
                                key={jour}
                                className={`rounded-lg border p-2.5 text-center ${
                                    count > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                                }`}
                            >
                                <p className={`text-xs font-bold ${count > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {JOURS_COURTS[jour]}
                                </p>
                                <p className={`text-lg font-black ${count > 0 ? 'text-blue-600' : 'text-gray-200'}`}>{count}</p>
                                <p className="text-[10px] text-gray-400">{count > 0 ? 'cours' : 'libre'}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!monthBounds || !currentMonth) return <EmptyState />;

    const monthTotal = (creneaux || []).filter((c) => {
        const iso = String(c?.date || c?.dateIso || c?.date_iso || '').slice(0, 10);
        if (!iso) return false;

        const d = parseIsoDate(iso);
        return d && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                <button
                    onClick={() => setMonthOffset((prev) => Math.max(prev - 1, 0))}
                    disabled={safeMonthOffset <= 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 capitalize">{formatMonthYear(currentMonth)}</p>
                    <p className="text-xs text-gray-400">{monthTotal} évaluation{monthTotal > 1 ? 's' : ''} planifiée{monthTotal > 1 ? 's' : ''}</p>
                </div>

                <button
                    onClick={() => setMonthOffset((prev) => Math.min(prev + 1, monthBounds.totalMonths - 1))}
                    disabled={safeMonthOffset >= monthBounds.totalMonths - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {DAYS_HEADERS.map((label) => (
                        <div key={label} className="p-2 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-gray-50">
                            {label}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {monthCells.map((cell) => {
                        const items = creneauxParDate.get(cell.iso) || [];
                        return (
                            <div
                                key={cell.iso}
                                className={`min-h-28 border-r border-b border-gray-100 p-1.5 ${
                                    cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/60'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                                            cell.isCurrentMonth ? 'text-gray-700 bg-gray-100' : 'text-gray-400 bg-gray-100/70'
                                        }`}
                                    >
                                        {cell.date.getDate()}
                                    </span>
                                    {items.length > 0 && (
                                        <span className="text-[10px] text-blue-600 font-semibold">
                                            {items.length}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {items.slice(0, 3).map((item) => (
                                        <CreneauCard key={item.id} creneau={item} onDelete={onDelete} compact />
                                    ))}
                                    {items.length > 3 && (
                                        <p className="text-[10px] text-gray-500 px-1">+{items.length - 3} autres</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Legende />
        </div>
    );
}
