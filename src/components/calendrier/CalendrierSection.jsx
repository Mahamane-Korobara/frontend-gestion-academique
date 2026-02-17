'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, LayoutGrid, List } from 'lucide-react';
import ListPageFilters from '@/components/partage/ListPageFilters';
import VueSemaine from './VueSemaine';
import VueMois from './VueMois';
import VueListe from './VueListe';
import { JOURS_ORDRE } from '@/lib/utils/constants';
import { groupByJour } from '@/lib/utils/emploiDuTempsHelpers';

const VUES = [
    { key: 'semaine', label: 'Semaine', Icon: LayoutGrid   },
    { key: 'mois',    label: 'Mois',    Icon: CalendarDays },
    { key: 'liste',   label: 'Liste',   Icon: List         },
];

export default function CalendrierSection({
    creneaux         = [],
    loading          = false,
    niveauxOptions   = [],
    semestresOptions = [],
    filieresOptions  = [],
    coursOptions     = [],
    filters          = {},
    onFiltreFiliere,       
    onFiltreNiveau,
    onFiltreSemestre,
    onFiltreCours,              
    onDelete,
}) {
    const [vue, setVue] = useState('semaine');

    /**
     * Calcul des statistiques pour le badge du filtre
     * Affiche le total de créneaux et le nombre de jours occupés
     */
    const stats = useMemo(() => {
        const parJour = groupByJour(creneaux);
        return {
            total: creneaux.length,
            jours: JOURS_ORDRE.filter(j => parJour[j] && parJour[j].length > 0).length,
        };
    }, [creneaux]);

    /**
     * Configuration des filtres pour le composant ListPageFilters
     * Définit l'ordre, les labels et les largeurs des colonnes
     */
    const filterOptions = useMemo(() => {
        const options = [];

        if (filieresOptions.length > 0) {
            options.push({ 
                key: 'filiere_id', 
                label: 'Filière', 
                options: filieresOptions, 
                width: '160px' 
            });
        }

        options.push({ 
            key: 'niveau_id', 
            label: 'Niveau', 
            options: niveauxOptions, 
            width: '160px' 
        });

        options.push({ 
            key: 'semestre_id', 
            label: 'Semestre', 
            options: semestresOptions, 
            width: '180px' 
        });

        if (coursOptions.length > 0) {
            options.push({ 
                key: 'cours_id', 
                label: 'Cours', 
                options: coursOptions, 
                width: '210px' 
            });
        }

        return options;
    }, [filieresOptions, niveauxOptions, semestresOptions, coursOptions]);

    /**
     * Handlers de modification
     */
    const handleFilterChange = (key, value) => {
        const val = value || null;
        if (key === 'filiere_id')  onFiltreFiliere?.(val);
        if (key === 'niveau_id')   onFiltreNiveau?.(val);
        if (key === 'semestre_id') onFiltreSemestre?.(val);
        if (key === 'cours_id')    onFiltreCours?.(val);
    };

    const handleReset = () => {
        onFiltreFiliere?.(null);
        onFiltreNiveau?.(null);
        onFiltreSemestre?.(null);
        onFiltreCours?.(null);
    };

    return (
        <div className="space-y-4">

            {/* ── Barre de Filtres & Stats ── */}
            <ListPageFilters
                hideSearch={true}
                inline={true}
                stats={stats}
                filterOptions={filterOptions}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                showResetButton={true} 
                onReset={handleReset}  
            />

            {/* ── Switcher de vue (Tabs compacts) ── */}
            <div className="flex justify-end">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5 shadow-inner">
                    {VUES.map(({ key, label, Icon }) => (
                        <button 
                            key={key} 
                            onClick={() => setVue(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                vue === key
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Contenu Dynamique (Grille / Calendrier / Liste) ── */}
            {loading ? (
                <div className="flex items-center justify-center py-32 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-9 h-9 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-500">Mise à jour du calendrier...</p>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    {vue === 'semaine' && <VueSemaine creneaux={creneaux} onDelete={onDelete} />}
                    {vue === 'mois'    && <VueMois    creneaux={creneaux} onDelete={onDelete} />}
                    {vue === 'liste'   && <VueListe   creneaux={creneaux} onDelete={onDelete} />}
                </div>
            )}
        </div>
    );
}