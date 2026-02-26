'use client';

import { useMemo, useState } from 'react';

import ListPageLayout from '@/components/partage/ListPageLayout';
import ListPageFilters from '@/components/partage/ListPageFilters';
import CalendrierSection from '@/components/calendrier/CalendrierSection';
import CalendrierEvaluationsSection from '@/components/calendrier/CalendrierEvaluationsSection';

import useEmploiDuTempsProfesseur from '@/lib/hooks/useEmploiDuTempsProfesseur';
import useEvaluationsProfesseur from '@/lib/hooks/useEvaluationsProfesseur';
import useProfesseurCours from '@/lib/hooks/useProfesseurCours';

export default function EmploiDuTempsProfesseurPage() {
    const [activeTab, setActiveTab] = useState('calendrier');
    const [evaluationFilters, setEvaluationFilters] = useState({
        filiere_id: null,
        niveau_id: null,
        semestre_id: null,
        cours_id: null,
        type_evaluation_id: null,
        statut: null,
    });

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

    const {
        evaluations,
        loading: evaluationsLoading,
        semestresOptions: semestresEvaluationsOptions,
        typeOptions,
        statutOptions,
    } = useEvaluationsProfesseur();

    const {
        cours: mesCours,
    } = useProfesseurCours();

    const coursById = useMemo(() => {
        const map = new Map();

        (mesCours || []).forEach((cours) => {
            const filiere = cours?.niveau?.filiere || cours?.filiere || null;
            const niveau = cours?.niveau
                ? {
                      ...cours.niveau,
                      filiere,
                  }
                : null;

            if (!cours?.id) return;

            map.set(String(cours.id), {
                ...cours,
                filiere_id: cours?.filiere_id ?? filiere?.id ?? null,
                niveau_id: cours?.niveau_id ?? niveau?.id ?? null,
                niveau,
            });
        });

        return map;
    }, [mesCours]);

    const filieresEvaluationsOptions = useMemo(() => {
        const map = new Map();

        (mesCours || []).forEach((cours) => {
            const filiere = cours?.niveau?.filiere || cours?.filiere;
            if (!filiere?.id) return;

            const id = String(filiere.id);
            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: filiere.nom || `Filière ${id}`,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [mesCours]);

    const niveauxEvaluationsOptions = useMemo(() => {
        const map = new Map();

        (mesCours || []).forEach((cours) => {
            const filiere = cours?.niveau?.filiere || cours?.filiere;
            const niveau = cours?.niveau;
            if (!niveau?.id) return;

            if (
                evaluationFilters.filiere_id &&
                String(filiere?.id) !== String(evaluationFilters.filiere_id)
            ) {
                return;
            }

            const id = String(niveau.id);
            if (!map.has(id)) {
                map.set(id, {
                    value: id,
                    label: filiere?.nom ? `${niveau.nom} — ${filiere.nom}` : (niveau.nom || `Niveau ${id}`),
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [mesCours, evaluationFilters.filiere_id]);

    const coursEvaluationsOptions = useMemo(() => {
        return (mesCours || [])
            .filter((cours) => {
                const filiere = cours?.niveau?.filiere || cours?.filiere;
                const niveau = cours?.niveau;

                if (
                    evaluationFilters.filiere_id &&
                    String(filiere?.id) !== String(evaluationFilters.filiere_id)
                ) {
                    return false;
                }

                if (
                    evaluationFilters.niveau_id &&
                    String(niveau?.id) !== String(evaluationFilters.niveau_id)
                ) {
                    return false;
                }

                return true;
            })
            .map((cours) => ({
                value: String(cours.id),
                label: cours.code ? `${cours.code} — ${cours.titre}` : (cours.titre || `Cours ${cours.id}`),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [mesCours, evaluationFilters.filiere_id, evaluationFilters.niveau_id]);

    const updateEvaluationFilter = (key, value) => {
        setEvaluationFilters((prev) => {
            const next = { ...prev, [key]: value || null };

            if (key === 'filiere_id') {
                next.niveau_id = null;
                next.cours_id = null;
            }

            if (key === 'niveau_id') {
                next.cours_id = null;
            }

            return next;
        });
    };

    const visibleEvaluationsCount = useMemo(
        () =>
            (evaluations || []).filter((ev) =>
                ['planifiee', 'en_cours'].includes(String(ev?.statut || '').toLowerCase())
            ).length,
        [evaluations]
    );

    const tabs = [
        { id: 'calendrier', label: 'Calendrier', count: creneaux.length },
        { id: 'examens', label: "Calendrier d'examen", count: visibleEvaluationsCount },
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
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <CalendrierEvaluationsSection
                        evaluations={evaluations}
                        loading={evaluationsLoading}
                        filters={evaluationFilters}
                        filieresOptions={filieresEvaluationsOptions}
                        niveauxOptions={niveauxEvaluationsOptions}
                        semestresOptions={semestresEvaluationsOptions}
                        coursOptions={coursEvaluationsOptions}
                        typeOptions={typeOptions}
                        statutOptions={statutOptions}
                        coursById={coursById}
                        allowDateCorrection={false}
                        onFiltreFiliere={(v) => updateEvaluationFilter('filiere_id', v)}
                        onFiltreNiveau={(v) => updateEvaluationFilter('niveau_id', v)}
                        onFiltreSemestre={(v) => updateEvaluationFilter('semestre_id', v)}
                        onFiltreCours={(v) => updateEvaluationFilter('cours_id', v)}
                        onFiltreType={(v) => updateEvaluationFilter('type_evaluation_id', v)}
                        onFiltreStatut={(v) => updateEvaluationFilter('statut', v)}
                    />
                </div>
            )}
        </ListPageLayout>
    );
}
