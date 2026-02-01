'use client';

import { useState, useEffect } from 'react';
import { filieresAPI } from '@/lib/api/endpoints';
import { niveauxAPI } from '@/lib/api/endpoints';
import { coursAPI } from '@/lib/api/endpoints';

/**
 * Hook pour charger les options dynamiques pour le formulaire d'annonce
 */
export const useAnnounceFormOptions = () => {
    const [filieres, setFilieres] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger les filières
    const fetchFilieres = async () => {
        try {
            const response = await filieresAPI.getAll({ per_page: 999 });
            setFilieres(response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des filières:', err);
            setError(err);
        }
    };

    // Charger les niveaux
    const fetchNiveaux = async () => {
        try {
            const response = await niveauxAPI.getAll();
            setNiveaux(response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des niveaux:', err);
            setError(err);
        }
    };

    // Charger les cours
    const fetchCours = async () => {
        try {
            const response = await coursAPI.getAll({ per_page: 999 });
            setCours(response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des cours:', err);
            setError(err);
        }
    };

    // Charger toutes les options au mount
    useEffect(() => {
        const loadAllOptions = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchFilieres(),
                    fetchNiveaux(),
                    fetchCours(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadAllOptions();
    }, []);

    return {
        filieres,
        niveaux,
        cours,
        loading,
        error,
    };
};

export default useAnnounceFormOptions;
