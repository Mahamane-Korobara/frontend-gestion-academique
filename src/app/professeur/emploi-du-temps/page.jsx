'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';

import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import CalendrierSection from '@/components/calendrier/CalendrierSection';

import useEmploiDuTempsProfesseur from '@/lib/hooks/useEmploiDuTempsProfesseur';

export default function EmploiDuTempsProfesseurPage() {
    const [activeTab, setActiveTab] = useState('calendrier');

    const {
        creneaux,
        loading,
        filters,
        totalCours,
        semestresOptions,
        filieresOptions,
        niveauxOptions,
        coursOptions,
        updateFilter,
        resetFilters,
    } = useEmploiDuTempsProfesseur();

    const tabs = [
        { id: 'calendrier', label: 'Calendrier', count: creneaux.length },
        { id: 'examens', label: "Calendrier d'examen" },
    ];

    return (
        <ListPageLayout
            title="Emploi du temps"
            description={`Consultez votre planning de cours. ${totalCours} cours affectes.`}
        >
            <ListPageFilters
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hideSearch={true}
                showResetButton={activeTab === 'calendrier'}
                onReset={resetFilters}
            />

            {activeTab === 'calendrier' && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <CalendrierSection
                        creneaux={creneaux}
                        loading={loading}
                        niveauxOptions={niveauxOptions}
                        semestresOptions={semestresOptions}
                        filieresOptions={filieresOptions}
                        coursOptions={coursOptions}
                        filters={filters}
                        onFiltreFiliere={(v) => updateFilter('filiere_id', v)}
                        onFiltreNiveau={(v) => updateFilter('niveau_id', v)}
                        onFiltreSemestre={(v) => updateFilter('semestre_id', v)}
                        onFiltreCours={(v) => updateFilter('cours_id', v)}
                    />
                </div>
            )}

            {activeTab === 'examens' && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    <div className="flex items-start gap-3">
                        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold">Calendrier d&apos;examen</h3>
                            <p className="mt-1 text-sm">
                                Cette vue est en cours de developpement.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </ListPageLayout>
    );
}
