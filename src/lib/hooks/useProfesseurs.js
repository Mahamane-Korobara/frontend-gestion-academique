'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usersAPI } from '@/lib/api/endpoints';

export const useProfesseurs = () => {
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchProfesseurs = useCallback(async () => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Tentative de récupération des utilisateurs avec le filtre rôle
            const response = await usersAPI.getAll({ role: 'professeur', per_page: 100 });

            // console.log('Réponse API brute:', response);

            if (!abortControllerRef.current.signal.aborted) {
                // Extraction sécurisée des données (gère les formats avec ou sans clé .data)
                const users = response.data || response || [];

                // console.log('Utilisateurs reçus (avant filtrage):', users);

                // FILTRAGE ET MAPPING : On ne garde que les vrais profils professeurs
                const profs = users
                    .filter(u => {
                        // On vérifie que le profil est de type 'professeur'
                        // Cela évite d'inclure les étudiants présents dans votre JSON
                        const isProf = u.profile?.type === 'professeur' && !!u.profile?.id;

                        if (!isProf && u.role?.name === 'professeur') {
                            console.warn(`User ${u.email} est marqué prof mais son profil est invalide ou de type ${u.profile?.type}`);
                        }
                        return isProf;
                    })
                    .map(u => ({
                        // On utilise l'ID du profile (ex: 1 ou 2) 
                        // C'est cet ID que Laravel attend pour affecter un cours
                        id: u.profile.id,
                        user_id: u.id,
                        // Nettoyage des espaces (votre JSON en contient un au début pour Almamy)
                        nom_complet: (u.profile.nom_complet || `${u.profile.prenom} ${u.profile.nom}`).trim(),
                        specialite: u.profile.specialite || 'Non définie',
                        grade: u.profile.grade || 'N/A',
                        code_professeur: u.profile.code || null,
                        email: u.email || null,
                    }));

                // console.log('Liste finale des professeurs mappés:', profs);

                setProfesseurs(profs);
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                console.error('Erreur chargement professeurs:', err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchProfesseurs();
        }
        return () => abortControllerRef.current?.abort();
    }, [fetchProfesseurs]);

    // Transformation pour les listes déroulantes (Select)
    const professeursOptions = professeurs.map(p => ({
        value: String(p.id), // ID de la table professeurs
        label: p.nom_complet,
        specialite: p.specialite,
        grade: p.grade,
        id: p.id,
    }));

    return {
        professeurs,
        professeursOptions,
        loading,
        error,
        refetch: fetchProfesseurs,
    };
};

export default useProfesseurs;