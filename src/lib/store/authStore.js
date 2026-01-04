import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store pour gérer l'authentification globale
 * - Persiste le user et token dans localStorage
 * - Accessible partout dans l'app
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // État
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            /**
             * Définir l'utilisateur connecté
             */
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            /**
             * Définir le token
             */
            setToken: (token) => set({ token }),

            /**
             * Login - Sauvegarder user et token
             */
            login: (user, token) => {
                // Sauvegarder dans localStorage via apiClient
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                }

                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },

            /**
             * Logout - Supprimer user et token
             */
            logout: () => {
                // Supprimer du localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }

                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            /**
             * Mettre à jour le profil utilisateur
             */
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            /**
             * Vérifier si l'utilisateur a un rôle spécifique
             */
            hasRole: (role) => {
                const { user } = get();
                return user?.role?.name === role;
            },

            /**
             * Obtenir le rôle de l'utilisateur
             */
            getUserRole: () => {
                const { user } = get();
                return user?.role?.name || null;
            },

            /**
             * Définir l'état de chargement
             */
            setLoading: (isLoading) => set({ isLoading }),

            /**
             * Hydrater depuis localStorage (au démarrage)
             */
            hydrate: () => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('token');
                    const userStr = localStorage.getItem('user');

                    if (token && userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            set({
                                user,
                                token,
                                isAuthenticated: true,
                            });
                        } catch (error) {
                            console.error('Erreur hydratation auth:', error);
                            get().logout();
                        }
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            // Ne persister que user et token
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;