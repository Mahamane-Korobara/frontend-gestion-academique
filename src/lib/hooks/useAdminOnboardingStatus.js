'use client';

import { useMemo } from 'react';
import useCycleAcademique from '@/lib/hooks/useCycleAcademique';
import useSemestres from '@/lib/hooks/useSemestres';
import useFilieres from '@/lib/hooks/useFilieres';
import useNiveaux from '@/lib/hooks/useNiveaux';

const STEP_META = {
    annee: {
        title: 'Créez votre première année académique',
        description: 'Ajoutez au moins une année académique pour démarrer la plateforme.',
        href: '/annees-academiques',
        actionLabel: 'Créer une année',
    },
    annee_active: {
        title: 'Activez une année académique',
        description: 'Une année doit être active pour pouvoir ouvrir des semestres.',
        href: '/annees-academiques',
        actionLabel: 'Activer une année',
    },
    semestre: {
        title: 'Ajoutez au moins un semestre',
        description: 'Créez un semestre dans l’année active, puis activez-en un.',
        href: '/annees-academiques',
        actionLabel: 'Configurer les semestres',
    },
    semestre_actif: {
        title: 'Activez un semestre',
        description: 'Sélectionnez un semestre actif pour débloquer la planification pédagogique.',
        href: '/annees-academiques',
        actionLabel: 'Activer un semestre',
    },
    filiere: {
        title: 'Créez votre première filière',
        description: 'Ajoutez au moins une filière avant de créer les niveaux et les cours.',
        href: '/filieres-niveaux',
        actionLabel: 'Créer une filière',
    },
    niveau: {
        title: 'Créez au moins un niveau',
        description: 'Ajoutez un niveau rattaché à une filière pour finaliser le paramétrage.',
        href: '/filieres-niveaux?tab=niveaux',
        actionLabel: 'Créer un niveau',
    },
};

export default function useAdminOnboardingStatus() {
    const {
        annees,
        anneeActive,
        loading: anneesLoading,
        error: anneesError,
        isInitialized: anneesInitialized,
    } = useCycleAcademique();

    const {
        semestres,
        semestreActif,
        loading: semestresLoading,
        error: semestresError,
        isInitialized: semestresInitialized,
    } = useSemestres();

    const {
        filieres,
        loading: filieresLoading,
        error: filieresError,
        isInitialized: filieresInitialized,
    } = useFilieres();

    const {
        niveaux,
        loading: niveauxLoading,
        error: niveauxError,
        isInitialized: niveauxInitialized,
    } = useNiveaux();

    const hasAnyAnnee = (annees || []).length > 0;
    const hasActiveAnnee = Boolean(anneeActive?.id);

    const hasAnySemestre = useMemo(() => {
        const countInAnnees = (annees || []).reduce((total, annee) => {
            if (Array.isArray(annee?.semestres)) return total + annee.semestres.length;
            if (typeof annee?.semestres_count === 'number') return total + annee.semestres_count;
            return total;
        }, 0);

        return countInAnnees > 0 || (semestres || []).length > 0;
    }, [annees, semestres]);

    const hasActiveSemestre = Boolean(semestreActif?.id);
    const hasAnyFiliere = (filieres || []).length > 0;
    const hasAnyNiveau = (niveaux || []).length > 0;

    const checklist = [
        { key: 'annee', label: 'Au moins une année académique', done: hasAnyAnnee },
        { key: 'annee_active', label: 'Une année académique active', done: hasActiveAnnee },
        { key: 'semestre', label: 'Au moins un semestre créé', done: hasAnySemestre },
        { key: 'semestre_actif', label: 'Un semestre actif', done: hasActiveSemestre },
        { key: 'filiere', label: 'Au moins une filière', done: hasAnyFiliere },
        { key: 'niveau', label: 'Au moins un niveau', done: hasAnyNiveau },
    ];

    const missingStep = useMemo(() => {
        if (!hasAnyAnnee) return { key: 'annee', ...STEP_META.annee };
        if (!hasActiveAnnee) return { key: 'annee_active', ...STEP_META.annee_active };
        if (!hasAnySemestre) return { key: 'semestre', ...STEP_META.semestre };
        if (!hasActiveSemestre) return { key: 'semestre_actif', ...STEP_META.semestre_actif };
        if (!hasAnyFiliere) return { key: 'filiere', ...STEP_META.filiere };
        if (!hasAnyNiveau) return { key: 'niveau', ...STEP_META.niveau };
        return null;
    }, [
        hasAnyAnnee,
        hasActiveAnnee,
        hasAnySemestre,
        hasActiveSemestre,
        hasAnyFiliere,
        hasAnyNiveau,
    ]);

    const loading = anneesLoading || semestresLoading || filieresLoading || niveauxLoading;
    const hasError = Boolean(anneesError || semestresError || filieresError || niveauxError);
    const isInitialized = Boolean(
        anneesInitialized &&
        semestresInitialized &&
        filieresInitialized &&
        niveauxInitialized
    );

    return {
        loading,
        hasError,
        isInitialized,
        isReady: !missingStep,
        missingStep,
        checklist,
    };
}
