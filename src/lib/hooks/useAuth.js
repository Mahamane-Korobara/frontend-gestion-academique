// ============================================
// HOOK AUTHENTIFICATION
// ============================================

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api/endpoints';
import { ROLE_ROUTES } from '../utils/constants';

/**
 * Hook pour gérer l'authentification
 * @returns {Object} - Méthodes et état d'auth
 */
export default function useAuth() {
    const router = useRouter();
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        isHydrated,
        login: loginStore,
        logout: logoutStore,
        setLoading,
        hasRole,
        getUserRole,
        updateUser,
        hydrate,
    } = useAuthStore();

    // Hydrater le store au montage
    useEffect(() => {
        hydrate();
    }, []);

    /**
     * Login utilisateur
     */
    const login = async (credentials) => {
        try {
            setLoading(true);

            // 1. Appel API
            const response = await authAPI.login(credentials);

            // 2. Sauvegarder user et token dans le store
            // Le store sauvegarde automatiquement dans localStorage
            loginStore(response.user, response.token);

            // 3. Sauvegarder la date de dernière connexion (UX)
            const loginDate = response.user.last_login_at || new Date().toISOString();
            localStorage.setItem('lastSuccessfulLogin', loginDate);

            // 4. Rediriger vers le dashboard approprié
            const role = response.user.role?.name;
            const redirectTo = ROLE_ROUTES[role] || '/';

            router.replace(redirectTo);

            return { success: true };
        } catch (error) {
            console.error('Erreur login:', error);
            return {
                success: false,
                message: error.message || 'Email ou mot de passe incorrect',
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout utilisateur
     */
    const logout = async () => {
        try {
            // Appeler l'API logout
            await authAPI.logout();
        } catch (error) {
            console.error('Erreur logout:', error);
        } finally {
            // Supprimer du store (qui supprime aussi du localStorage)
            logoutStore();

            // Rediriger vers login
            router.push('/login');
        }
    };

    /**
     * Changer le mot de passe
     */
    const changePassword = async (data) => {
        try {
            await authAPI.changePassword(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Erreur changement mot de passe',
                errors: error.errors,
            };
        }
    };

    /**
     * Mettre à jour le profil
     */
    const updateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data);
            updateUser(response.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Erreur mise à jour profil',
                errors: error.errors,
            };
        }
    };

    /**
     * Récupérer les infos utilisateur
     */
    const fetchUser = async () => {
        try {
            const response = await authAPI.me();
            updateUser(response.user);
            return response.user;
        } catch (error) {
            console.error('Erreur fetch user:', error);
            // Si erreur 401, déconnecter
            if (error.status === 401) {
                logoutStore();
                router.push('/login');
            }
            return null;
        }
    };

    return {
        // État
        user,
        token,
        isAuthenticated,
        isLoading,
        isHydrated,

        // Méthodes
        login,
        logout,
        changePassword,
        updateProfile,
        fetchUser,
        hasRole,
        getUserRole,
    };
};