'use client';

import { useState, useEffect, useCallback } from 'react';
import { filieresAPI, niveauxAPI, coursAPI } from '@/lib/api/endpoints';
import { professeurCoursService } from '@/lib/services/professeurCours.service';
import useAuth from '@/lib/hooks/useAuth';

/**
 * Hook hybride pour charger les options du formulaire d'annonce
 */
export const useAnnounceFormOptions = () => {
    const { user } = useAuth();
    const [filieres, setFilieres] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadOptions = useCallback(async () => {
        const userRole = user?.role?.name;
        if (!userRole) return;

        setLoading(true);
        setError(null);

        try {
            if (userRole === 'professeur') {
                // LOGIQUE PROFESSEUR : Appel unique optimisé
                const data = await professeurCoursService.getFormOptions();
                setFilieres(data.filieres || []);
                setNiveaux(data.niveaux || []);
                setCours(data.cours || []);
            } else {
                // LOGIQUE ADMIN : Appels parallèles sur endpoints génériques
                const [fRes, nRes, cRes] = await Promise.all([
                    filieresAPI.getAll({ per_page: 999 }),
                    niveauxAPI.getAll(),
                    coursAPI.getAll({ per_page: 999 }),
                ]);

                setFilieres(fRes.data || []);
                setNiveaux(nRes.data || []);
                setCours(cRes.data || []);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des options:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user?.role?.name]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    return {
        filieres,
        niveaux,
        cours,
        loading,
        error,
        refresh: loadOptions // Permet de recharger manuellement si besoin
    };
};

export default useAnnounceFormOptions;