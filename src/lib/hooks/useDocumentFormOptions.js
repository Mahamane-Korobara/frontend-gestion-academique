'use client';

import { useState, useEffect, useCallback } from 'react';
import { filieresAPI, niveauxAPI, coursAPI } from '@/lib/api/endpoints';
import { professeurCoursService } from '@/lib/services/professeurCours.service';
import useAuth from '@/lib/hooks/useAuth';

/**
 * Hook optimisé pour les options du formulaire de documents.
 * Filtre les données pour les professeurs (uniquement leurs cours/filières).
 */
export default function useDocumentFormOptions() {
    const { user } = useAuth();
    const [filieres, setFilieres] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadOptions = useCallback(async () => {
        const userRole = user?.role?.name;

        // Attendre que l'utilisateur soit chargé
        if (!userRole) return;

        setLoading(true);
        setError(null);

        try {
            if (userRole === 'professeur') {
                /**
                 * LOGIQUE PROFESSEUR :
                 * Un seul appel API qui retourne uniquement ce que le prof enseigne.
                 */
                const data = await professeurCoursService.getFormOptions();

                setFilieres(data?.filieres || []);
                setNiveaux(data?.niveaux || []);
                setCours(data?.cours || []);
            } else {
                /**
                 * LOGIQUE ADMIN / STAFF :
                 * Appels parallèles pour récupérer l'intégralité des données.
                 */
                const [fRes, nRes, cRes] = await Promise.all([
                    filieresAPI.getAll({ per_page: 999 }).catch(() => ({ data: [] })),
                    niveauxAPI.getAll().catch(() => ({ data: [] })),
                    coursAPI.getAll({ per_page: 999 }).catch(() => ({ data: [] })),
                ]);

                // Extraction sécurisée des données selon le format de l'API
                setFilieres(fRes?.data || (Array.isArray(fRes) ? fRes : []));
                setNiveaux(nRes?.data || (Array.isArray(nRes) ? nRes : []));
                setCours(cRes?.data || (Array.isArray(cRes) ? cRes : []));
            }
        } catch (err) {
            console.error('Erreur lors du chargement des options documents:', err);
            setError('Erreur lors de la récupération des listes.');

            // Reset en cas d'échec
            setFilieres([]);
            setNiveaux([]);
            setCours([]);
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
        refresh: loadOptions // Permet de recharger manuellement les données
    };
}