'use client';

import { useMemo, useState, Fragment } from 'react';
import {
    Trash2, BookOpen, Users, FlaskConical, GraduationCap,
    CalendarDays, LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import FormSelect from '@/components/forms/FormSelect';

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ──────────────────────────────────────────────────────────────────────────────
const JOURS_ORDRE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const JOURS_COURTS = { Lundi: 'Lun', Mardi: 'Mar', Mercredi: 'Mer', Jeudi: 'Jeu', Vendredi: 'Ven', Samedi: 'Sam' };

const TYPE_STYLES = {
    blue:   { card: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
    green:  { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    purple: { card: 'bg-violet-50 border-violet-200',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500'  },
    red:    { card: 'bg-rose-50 border-rose-200',      badge: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500'    },
};
const TYPE_LABELS = { blue: 'Cours', green: 'TD', purple: 'TP', red: 'Examen' };
const TYPE_ICONS  = { cours: BookOpen, td: Users, tp: FlaskConical, examen: GraduationCap };

const getStyles = (color) => TYPE_STYLES[color] || TYPE_STYLES.blue;

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────
function getProfNom(c) {
    if (!c.professeur) return '—';
    return `${c.professeur.prenom} ${c.professeur.nom}`;
}

function groupByJour(creneaux) {
    const map = {};
    JOURS_ORDRE.forEach(j => { map[j] = []; });
    creneaux.forEach(c => { if (map[c.jour]) map[c.jour].push(c); });
    JOURS_ORDRE.forEach(j => {
        map[j].sort((a, b) => (a.creneau?.debut || '').localeCompare(b.creneau?.debut || ''));
    });
    return map;
}

// ──────────────────────────────────────────────────────────────────────────────
// CARTE CRÉNEAU
// ──────────────────────────────────────────────────────────────────────────────
function CreneauCard({ creneau, onDelete, compact = false }) {
    const styles = getStyles(creneau.type?.color);
    const Icon   = TYPE_ICONS[creneau.type?.code] || BookOpen;

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
                    <button
                        onClick={() => onDelete?.(creneau.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-red-500 shrink-0"
                    >
                        <Trash2 className="w-2.5 h-2.5" />
                    </button>
                </div>
                <p className="text-[9px] text-gray-400 truncate pl-2.5">
                    {creneau.creneau?.debut}–{creneau.creneau?.fin}
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
                <button
                    onClick={() => onDelete?.(creneau.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
            <p className="text-xs font-bold text-gray-800 truncate">{creneau.cours?.titre || '—'}</p>
            <p className="text-[10px] text-gray-500 truncate">{creneau.cours?.code}</p>
            <p className="text-[10px] text-gray-500 mt-1 truncate">👤 {getProfNom(creneau)}</p>
            {creneau.salle  && <p className="text-[10px] text-gray-400 truncate">🏛️ {creneau.salle.nom}</p>}
            {creneau.niveau && <p className="text-[10px] text-gray-400 truncate">📚 {creneau.niveau.nom}</p>}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// VUE SEMAINE
// ──────────────────────────────────────────────────────────────────────────────
function VueSemaine({ creneaux, onDelete }) {
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
            <div className="min-w-[600px]"
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
                                    className="border-b border-l border-gray-100 p-1.5 min-h-[80px] space-y-1"
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

// ──────────────────────────────────────────────────────────────────────────────
// VUE MOIS
// ──────────────────────────────────────────────────────────────────────────────
function VueMois({ creneaux, onDelete }) {
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
                <div className="min-w-[500px]"
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
                            <div key={jour} className="border-r border-b border-gray-100 p-2 min-h-[120px] last:border-r-0 space-y-1.5">
                                {list.length === 0
                                    ? <div className="flex items-center justify-center h-full min-h-[100px]"><span className="text-xs text-gray-200">—</span></div>
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

// ──────────────────────────────────────────────────────────────────────────────
// VUE LISTE
// ──────────────────────────────────────────────────────────────────────────────
function VueListe({ creneaux, onDelete }) {
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
                                    <button onClick={() => onDelete?.(c.id)}
                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPOSANTS PARTAGÉS
// ──────────────────────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-200">
            <span className="text-5xl">🗓️</span>
            <p className="text-sm font-medium text-gray-500">Aucun créneau pour ce filtre</p>
            <p className="text-xs text-gray-300">Modifiez les filtres ou créez des créneaux</p>
        </div>
    );
}

function Legende() {
    return (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            {Object.entries(TYPE_STYLES).map(([color, styles]) => (
                <div key={color} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                    <span className="text-[11px] text-gray-500">{TYPE_LABELS[color]}</span>
                </div>
            ))}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────
const VUES = [
    { key: 'semaine', label: 'Semaine', Icon: LayoutGrid   },
    { key: 'mois',    label: 'Mois',    Icon: CalendarDays },
    { key: 'liste',   label: 'Liste',   Icon: List         },
];

export default function CalendrierSection({
    creneaux         = [],
    loading          = false,
    // Options pour les selects
    niveauxOptions   = [],
    semestresOptions = [],
    filieresOptions  = [],
    coursOptions     = [],      // ✅ NOUVEAU : options des cours
    // Valeurs des filtres (contrôlés par la page parente)
    filters          = {},
    // Callbacks filtres
    onFiltreFiliere,            // ✅ NOUVEAU
    onFiltreNiveau,
    onFiltreSemestre,
    onFiltreCours,              // ✅ NOUVEAU
    onDelete,
}) {
    const [vue, setVue] = useState('semaine');

    const stats = useMemo(() => {
        const parJour = groupByJour(creneaux);
        return {
            total: creneaux.length,
            jours: JOURS_ORDRE.filter(j => parJour[j].length > 0).length,
        };
    }, [creneaux]);

    return (
        <div className="space-y-4">

            {/* ── Barre de contrôle ── */}
            <div className="flex flex-col gap-3">

                {/* Ligne 1 : filtres */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
                        Filtrer :
                    </span>

                    {/* Filière */}
                    {filieresOptions.length > 0 && (
                        <div className="w-40">
                            <FormSelect
                                id="filtre-filiere"
                                value={filters.filiere_id || ''}
                                onValueChange={v => onFiltreFiliere?.(v || null)}
                                options={[{ value: '', label: 'Toutes les filières' }, ...filieresOptions]}
                                placeholder="Filière"
                            />
                        </div>
                    )}

                    {/* Niveau */}
                    <div className="w-40">
                        <FormSelect
                            id="filtre-niveau"
                            value={filters.niveau_id || ''}
                            onValueChange={v => onFiltreNiveau?.(v || null)}
                            options={[{ value: '', label: 'Tous les niveaux' }, ...niveauxOptions]}
                            placeholder="Niveau"
                        />
                    </div>

                    {/* Semestre — ✅ FIX : envoie null au lieu de '' pour "Tous" */}
                    <div className="w-48">
                        <FormSelect
                            id="filtre-semestre"
                            value={filters.semestre_id || ''}
                            onValueChange={v => onFiltreSemestre?.(v || null)}
                            options={[{ value: '', label: 'Tous les semestres' }, ...semestresOptions]}
                            placeholder="Semestre"
                        />
                    </div>

                    {/* Cours */}
                    {coursOptions.length > 0 && (
                        <div className="w-52">
                            <FormSelect
                                id="filtre-cours"
                                value={filters.cours_id || ''}
                                onValueChange={v => onFiltreCours?.(v || null)}
                                options={[{ value: '', label: 'Tous les cours' }, ...coursOptions]}
                                placeholder="Cours"
                            />
                        </div>
                    )}

                    {/* Compteur */}
                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {stats.total} créneau{stats.total > 1 ? 'x' : ''} · {stats.jours} jour{stats.jours > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Ligne 2 : switcher de vue */}
                <div className="flex justify-end">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
                        {VUES.map(({ key, label, Icon }) => (
                            <button key={key} onClick={() => setVue(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    vue === key
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Contenu ── */}
            {loading ? (
                <div className="flex items-center justify-center py-24 bg-white rounded-xl border border-gray-200">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Chargement...</p>
                    </div>
                </div>
            ) : (
                <>
                    {vue === 'semaine' && <VueSemaine creneaux={creneaux} onDelete={onDelete} />}
                    {vue === 'mois'    && <VueMois    creneaux={creneaux} onDelete={onDelete} />}
                    {vue === 'liste'   && <VueListe   creneaux={creneaux} onDelete={onDelete} />}
                </>
            )}
        </div>
    );
}